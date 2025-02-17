const { Text, Checkbox, Select, Relationship } = require('@keystonejs/fields');

const {
  newEnvironmentID,
  isEnvironmentID,
} = require('../services/identifiers');

const {
  ValidateActiveEnvironment,
  DeleteEnvironment,
  DeleteEnvironmentValidate,
} = require('../services/workflow');

const {
  FieldEnforcementPoint,
  EnforcementPoint,
} = require('../authz/enforcement');
const { logger } = require('../logger');

module.exports = {
  fields: {
    appId: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: {
        create: true,
        update: false,
      },
    },
    name: {
      type: Text,
      isRequired: true,
    },
    active: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
      access: FieldEnforcementPoint,
    },
    approval: {
      type: Checkbox,
      isRequired: true,
      defaultValue: false,
    },
    flow: {
      type: Select,
      emptyOption: false,
      dataType: 'string',
      defaultValue: 'public',
      options: [
        { value: 'public', label: 'Public' },
        {
          value: 'authorization-code',
          label: 'Oauth2 Authorization Code Flow',
        },
        {
          value: 'client-credentials',
          label: 'Oauth2 Client Credentials Flow',
        },
        { value: 'kong-acl-only', label: 'Kong ACL Only' },
        { value: 'kong-api-key-only', label: 'Kong API Key Only' },
        { value: 'kong-api-key-acl', label: 'Kong API Key with ACL Flow' },
      ],
    },

    legal: { type: Relationship, ref: 'Legal' },
    credentialIssuer: {
      type: Relationship,
      ref: 'CredentialIssuer.environments',
    },
    additionalDetailsToRequest: {
      type: Text,
      isMultiline: true,
      isRequired: false,
    },
    services: {
      type: Relationship,
      ref: 'GatewayService.environment',
      many: true,
    },
    product: {
      type: Relationship,
      ref: 'Product.environments',
      many: false,
      access: { update: false },
    },
  },
  access: EnforcementPoint,
  hooks: {
    resolveInput: async function ({
      operation,
      existingItem,
      originalInput,
      resolvedData,
      context,
      listKey,
      fieldPath, // Field hooks only
    }) {
      if (operation == 'create') {
        if ('appId' in resolvedData && isEnvironmentID(resolvedData['appId'])) {
        } else {
          resolvedData['appId'] = newEnvironmentID();
        }
      }
      return resolvedData;
    },
    validateInput: async function ({
      operation,
      existingItem,
      originalInput,
      resolvedData,
      context,
      addFieldValidationError, // Field hooks only
      addValidationError, // List hooks only
      listKey,
      fieldPath, // Field hooks only
    }) {
      if (operation == 'update' && 'product' in resolvedData) {
        logger.warn('%j %j %j', existingItem, originalInput, resolvedData);
        addValidationError('Product can not be changed for an Environment');
      }
      await ValidateActiveEnvironment(
        context,
        operation,
        existingItem,
        originalInput,
        resolvedData,
        addValidationError
      );
    },
    validateDelete: async function ({ existingItem, context }) {
      await DeleteEnvironmentValidate(
        context,
        context.authedItem['namespace'],
        existingItem.id
      );
    },
    // beforeDelete: async function ({
    //   operation,
    //   existingItem,
    //   context,
    //   listKey,
    //   fieldPath, // exists only for field hooks
    // }) {
    //   await DeleteEnvironment(
    //     context.createContext({ skipAccessControl: true }),
    //     operation,
    //     { environmentId: existingItem.id }
    //   );
    // },
  },
  extensions: [
    (keystone) => {
      keystone.extendGraphQLSchema({
        mutations: [
          {
            schema: 'forceDeleteEnvironment(id: ID!, force: Boolean!): Boolean',
            resolver: async (item, args, context, info, { query, access }) => {
              console.log('ForceDeleteEnvironment! ' + JSON.stringify(args));
              if (args.force === false) {
                await DeleteEnvironmentValidate(
                  context.createContext({ skipAccessControl: true }),
                  context.authedItem['namespace'],
                  args.id
                );
              }
              await DeleteEnvironment(
                context.createContext({ skipAccessControl: true }),
                context.authedItem['namespace'],
                args.id,
                args.force
              );
              return true;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
