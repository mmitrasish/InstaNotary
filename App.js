import * as React from "react";
import { View, AsyncStorage } from "react-native";
import Routes from "./routes";
import { AuthContext } from "./hooks";
import { WebService } from "./services";
import { sortNotaries } from "./utils";
import { assignConfig } from "./constants";

function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userMobileNumber: action.token,
            isLoading: false,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userMobileNumber: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userMobileNumber: null,
          };
        case "SET_ALL_NOTARIES":
          return {
            ...prevState,
            allNotaries: action.allNotaries,
            backupNotaries: action.allNotaries,
          };
        case "SET_ONLY_ALL_NOTARIES":
          return {
            ...prevState,
            allNotaries: action.allNotaries,
          };
        case "TOGGLE_FETCH_LOADING":
          return {
            ...prevState,
            isFetching: action.isFetching,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userMobileNumber: null,
      allNotaries: [],
      backupNotaries: [],
      isFetching: false,
    }
  );
  React.useEffect(() => {
    setTimeout(() => {
      _retrieveData();
    }, 2000);
  }, []);

  const _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem("mobileNumber");
      dispatch({ type: "RESTORE_TOKEN", token: value });
    } catch (error) {
      // Error retrieving data
    }
  };

  const authContext = React.useMemo(
    () => ({
      signIn: (data) => {
        dispatch({ type: "SIGN_IN", token: data });
      },
      signOut: () => {
        dispatch({ type: "SET_ALL_NOTARIES", allNotaries: [] });
        dispatch({ type: "SIGN_OUT" });
      },
      fetchNotaryItem: async (userMobileNumber) => {
        dispatch({ type: "TOGGLE_FETCH_LOADING", isFetching: true });

        const allNotaries = await WebService.getNotaryItemsByNumber(
          userMobileNumber
        );
        console.log(allNotaries);
        const finalSort = allNotaries.notaries
          ? sortNotaries(allNotaries.notaries)
          : [];
        dispatch({ type: "SET_ALL_NOTARIES", allNotaries: finalSort });
        dispatch({ type: "TOGGLE_FETCH_LOADING", isFetching: false });
      },
      setAllNotaries: (allNotaries) => {
        dispatch({ type: "SET_ONLY_ALL_NOTARIES", allNotaries });
      },
    }),
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <AuthContext.Provider value={{ authContext, state }}>
        <Routes state={state} />
      </AuthContext.Provider>
    </View>
  );
}

export default App;
