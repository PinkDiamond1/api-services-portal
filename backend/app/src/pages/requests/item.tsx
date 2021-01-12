import { styles } from '../../shared/styles/devportal.css';

import graphql from '../../shared/services/graphql'

import { REMOVE } from './queries'

import NameValue from '../../components/name-value';

const Item = props => (
    <li style={styles.listItem}>
    { props && props.accessRequest ? (
        <>
        <NameValue name="Created" value={props.accessRequest.createdAt} width="300px"/>
        <NameValue name="Name" value={props.accessRequest.name} width="300px"/>
        <NameValue name="Family" value={ props.accessRequest.datasetGroup && (
                <p>Dataset {props.accessRequest.datasetGroup.name}</p>
        )} width="200px"/>
        <NameValue name="Organization" value={ props.accessRequest.datasetGroup && props.accessRequest.datasetGroup.organization && props.accessRequest.datasetGroup.organizationUnit ? (
            <p>{props.accessRequest.datasetGroup.organization.name} {"->"} {props.accessRequest.datasetGroup.organizationUnit.name}</p>
        ):false} width="400px"/>

        { props.accessRequest.isApproved === null ? (
            <div className="flex">
                <button style={styles.primaryButton}>Approve</button>
            </div>
        ) : false }
        { props.accessRequest.isApproved && props.accessRequest.isIssued == null ? (
            <button style={styles.primaryButton}>Send Credentials</button>
        ) : false}
        { props.accessRequest.isComplete == true ? (
            <p>COMPLETE</p>
        ): false }
        <button
                style={styles.primaryButton}
                className="trash"
                onClick={() => {
                graphql(REMOVE, { id: props.accessRequest.id }).then(props.refetch);
                }}
              >
        <svg viewBox="0 0 14 16" style={styles.deleteIcon}>
          <title>Delete this item</title>
          <path
            fillRule="evenodd"
            d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"
          />
        </svg>
      </button>
      </>
  ):false }
  </li>
)

export default Item