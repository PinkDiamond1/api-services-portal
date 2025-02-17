import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import KeycloakAdminClient, {
  default as KcAdminClient,
} from '@keycloak/keycloak-admin-client';
import {
  KeycloakClientPolicyService,
  KeycloakClientService,
  KeycloakGroupService,
} from '../keycloak';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import ClientScopeRepresentation from '@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation';
import PolicyRepresentation, {
  DecisionStrategy,
  Logic,
} from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import ResourceServerRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation';
import { GroupAccess, GroupRole, OrgNamespace } from './types';
import { OrganizationGroup, OrgGroupService } from './org-group-service';
import { leaf, parent, root, convertToOrgGroup } from './group-converter-utils';

const logger = Logger('org-group.ns');

export class NamespaceService {
  private groupService;

  constructor(issuerUrl: string) {
    this.groupService = new KeycloakGroupService(issuerUrl);
  }

  async login(clientId: string, clientSecret: string) {
    await this.groupService.login(clientId, clientSecret);
  }

  /*
    Update the Group attributes for org and org-unit
  */
  async assignNamespaceToOrganization(
    ns: string,
    org: string,
    orgUnit: string
  ): Promise<boolean> {
    const group = await this.groupService.getGroup('ns', ns);

    logger.debug('[assignNamespaceToOrganization] %s - Group = %j', ns, group);

    assert.strictEqual(group === null, false, 'Namespace not found');

    assert.strictEqual(
      'org' in group.attributes && org != group.attributes['org'],
      false,
      `[${ns}] Org Already assigned`
    );
    assert.strictEqual(
      'org-unit' in group.attributes && orgUnit != group.attributes['org-unit'],
      false,
      `[${ns}] Org Unit Already assigned`
    );

    if (
      'org' in group.attributes &&
      group.attributes['org'][0] === org &&
      'org-unit' in group.attributes &&
      group.attributes['org-unit'][0] === orgUnit
    ) {
      logger.debug('[assignNamespaceToOrganization] %s - Already assigned', ns);
      return false;
    }

    group.attributes['org'] = [org];
    group.attributes['org-unit'] = [orgUnit];
    await this.groupService.updateGroup(group);
    return true;
  }

  async unassignNamespaceFromOrganization(
    ns: string,
    org: string,
    orgUnit: string
  ): Promise<boolean> {
    const group = await this.groupService.getGroup('ns', ns);

    logger.debug(
      '[unassignNamespaceFromOrganization] %s - Group = %j',
      ns,
      group
    );

    if (
      'org' in group.attributes &&
      group.attributes['org'][0] === org &&
      'org-unit' in group.attributes &&
      group.attributes['org-unit'][0] === orgUnit
    ) {
      logger.debug(
        '[unassignNamespaceFromOrganization] %s - Matched assignment - removing',
        ns
      );
      delete group.attributes['org'];
      delete group.attributes['org-unit'];
      await this.groupService.updateGroup(group);
      return true;
    }
    return false;
  }

  async markNamespaceAsDecommissioned(ns: string): Promise<boolean> {
    const group = await this.groupService.getGroup('ns', ns);

    logger.debug('[markNamespaceAsDecommissioned] %s - Group = %j', ns, group);

    assert.strictEqual(group === null, false, 'Namespace not found');

    assert.strictEqual(
      'decommissioned' in group.attributes,
      false,
      `[${ns}] Namespace already decommissioned`
    );

    group.attributes['decommissioned'] = ['true'];
    await this.groupService.updateGroup(group);
    return true;
  }

  async checkNamespaceAvailable(ns: string): Promise<void> {
    const group = await this.groupService.getGroup('ns', ns);
    assert.strictEqual(group === null, true, 'Namespace already exists');
  }

  async listAssignedNamespacesByOrg(org: string): Promise<OrgNamespace[]> {
    const groups = await this.groupService.getGroups('ns', false);
    assert.strictEqual(
      groups.length == 1 && groups[0].name == 'ns',
      true,
      'Unexpected data returned'
    );

    const namespaceGroups = groups[0].subGroups;

    const matches = namespaceGroups
      .filter(
        (group) =>
          'org' in group.attributes && group.attributes['org'][0] === org
      )
      .map((group) => ({
        name: group.name,
        orgUnit: group.attributes['org-unit'][0],
      }));
    logger.debug('[listAssignedNamespaces] [%s] Result %j', org, matches);
    return matches;
  }
}
