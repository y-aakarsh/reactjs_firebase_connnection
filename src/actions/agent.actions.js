import { SUCCESS, REQUEST, FAILURE } from "./constant.actions.js";
import fire from "../dbUtils/db_fire";
import { verifyPasswordFailure } from "./user.actions";
export const GET_AGENTS_REQUEST = "GET_AGENTS_request";
export const GET_AGENTS_SUCCESS = "GET_AGENTS_success";
export const GET_AGENTS_FAILURE = "GET_AGENTS_failure";

export const UPDATE_AGENTS_REQUEST = "UPDATE_AGENTS_request";
export const UPDATE_AGENTS_SUCCESS = "UPDATE_AGENTS_success";
export const UPDATE_AGENTS_FAILURE = "UPDATE_AGENTS_failure";

export const CREATE_AGENTS_REQUEST = "CREATE_AGENTS_request";
export const CREATE_AGENTS_SUCCESS = "CREATE_AGENTS_success";
export const CREATE_AGENTS_FAILURE = "CREATE_AGENTS_failure";

export function getAgentsRequest() {
  return {
    type: GET_AGENTS_REQUEST,
    status: REQUEST
  };
}
export function getAgentsSuccess(agents) {
  return {
    type: GET_AGENTS_SUCCESS,
    status: SUCCESS,
    agents
  };
}
export function getAgentsFailure(error) {
  return {
    type: GET_AGENTS_FAILURE,
    status: FAILURE,
    error
  };
}
export function getAgents(userObj) {
  return async (dispatch, state) => {
    dispatch(getAgentsRequest());
    try {
      let ref = await fire.database().ref("agents");
      await ref.on(
        "value",
        async function(snapshot) {
          dispatch(getAgentsSuccess(snapshot.val()));
        },
        function(errorObject) {
          throw new Error("Error");
        }
      );
    } catch (e) {
      dispatch(getAgentsFailure("Error in logging in user"));
    }
  };
}

export function updateAgentRequest() {
  return {
    type: UPDATE_AGENTS_REQUEST,
    status: REQUEST
  };
}
export function updateAgentSuccess(agent) {
  return {
    type: UPDATE_AGENTS_SUCCESS,
    status: SUCCESS,
    agent
  };
}
export function updateAgentFailure(error) {
  return {
    type: UPDATE_AGENTS_FAILURE,
    status: FAILURE,
    error
  };
}
export function updateAgent(agentId, userObj = null) {
  console.log(agentId, userObj);
  let agentUpdateKey, clientUpdateKey;
  return async (dispatch, state) => {
    dispatch(updateAgentRequest());
    try {
      await fire
        .database()
        .ref(`agents`)
        .orderByChild("idNumber")
        .equalTo(agentId)
        .once("value", data => {
          agentUpdateKey = Object.keys(data.val())[0];
        });
      if (userObj !== null) {
        await fire
          .database()
          .ref(`agents/${agentUpdateKey}/Clients`)
          .orderByChild("IdNumber")
          .equalTo(userObj.IdNumber)
          .once("value", data => {
            clientUpdateKey = Object.keys(data.val())[0];
          });
        await fire
          .database()
          .ref(`agents/${agentUpdateKey}/Clients/${clientUpdateKey}`)
          .update(userObj);
        await fire
          .database()
          .ref(`agents`)
          .on(
            "value",
            async function(snapshot) {
              dispatch(verifyPasswordFailure());
              dispatch(updateAgentSuccess(snapshot.val()));
            },
            function(errorObject) {
              throw new Error("Error");
            }
          );
      } else {
        await fire
          .database()
          .ref(`agents/${agentUpdateKey}`)
          .update({ status: 0 });
        await fire
          .database()
          .ref(`agents`)
          .on(
            "value",
            async function(snapshot) {
              dispatch(verifyPasswordFailure());
              dispatch(updateAgentSuccess(snapshot.val()));
            },
            function(errorObject) {
              throw new Error("Error");
            }
          );
      }
    } catch (e) {
      dispatch(updateAgentFailure("Error in logging in user"));
    }
  };
}

export function createAgentRequest() {
  return {
    type: CREATE_AGENTS_REQUEST,
    status: REQUEST
  };
}
export function createAgentSuccess(agents) {
  return {
    type: CREATE_AGENTS_SUCCESS,
    status: SUCCESS,
    agents
  };
}
export function createAgentFailure(error) {
  return {
    type: CREATE_AGENTS_FAILURE,
    status: FAILURE,
    error
  };
}
export function createAgent(agentObj) {
  let isUnique = true;
  return async (dispatch, state) => {
    dispatch(createAgentRequest());
    try {
      let ref = await fire
        .database()
        .ref(`agents`)
        .push(agentObj);
      ref = await fire.database().ref(`agents`);
      await ref.on(
        "value",
        async function(snapshot) {
          dispatch(createAgentSuccess(snapshot.val()));
        },
        function(errorObject) {
          throw new Error("Error");
        }
      );
    } catch (e) {
      dispatch(createAgentFailure("Error in logging in user"));
    }
  };
}
