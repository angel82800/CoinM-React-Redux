import { Map } from "immutable";

import * as actionTypes from "../../constants/ActionTypes";

const initialState = new Map({
    userData: {},

    userId: null,
    userToken: "",
    resetToken: "",

    referralWallet: null,

    loginError: null,
    signupError: null,
    verifyEmailError: null,
    fetchUserError: null,
    resetPasswordError: null,
    signOutError: null,
    sendResetLinkError: null,
    updateProfileError: null,
    setOptInError: null,

    loginLoading: false,
    signupLoading: false,
    signOutLoading: false,
    verifyEmailLoading: false,
    fetchUserLoading: false,
    resetPasswordLoading: false,
    sendResetLinkLoading: false,
    updateProfileLoading: false,
    setOptInLoading: false
});

function userReducer(state = initialState, action) {
    if (!action)
        return state;

    switch (action.type) {
        case actionTypes.USER_LOGIN: {
            return Object.assign({}, state, {
                loginLoading: true
            });
        }

        case actionTypes.USER_LOGIN_SUCCESS: {
            return Object.assign({}, state, {
                loginLoading: false,
                loginError: null,
                userId: action.userId,
                userToken: action.token
            });
        }

        case actionTypes.USER_LOGIN_ERROR: {
            return Object.assign({}, state, {
                loginLoading: false,
                loginError: action.errorMsg
            });
        }

        case actionTypes.USER_LOGIN_ERROR_RESET: {
            return Object.assign({}, state, {
                loginLoading: false,
                loginError: null
            });
        }

        case actionTypes.USER_SIGNUP: {
            return Object.assign({}, state, {
                signupLoading: true
            });
        }

        case actionTypes.USER_SIGNUP_SUCCESS: {
            return Object.assign({}, state, {
                signupLoading: false,
                signupError: null
            });
        }

        case actionTypes.USER_SIGNUP_ERROR: {
            return Object.assign({}, state, {
                signupLoading: false,
                signupError: action.errorMsg
            });
        }

        case actionTypes.USER_SIGNUP_ERROR_RESET: {
            return Object.assign({}, state, {
                signupLoading: false,
                signupError: null
            });
        }

        case actionTypes.FETCH_CURRENT_USER: {
            return Object.assign({}, state, {
                fetchUserLoading: true
            });
        }

        case actionTypes.FETCH_CURRENT_USER_SUCCESS: {
            return Object.assign({}, state, {
                userData: action.data,
                fetchUserLoading: false,
                fetchUserError: null
            });
        }

        case actionTypes.FETCH_CURRENT_USER_ERROR: {
            return Object.assign({}, state, {
                fetchUserLoading: false,
                fetchUserError: action.errorMsg
            });
        }

        case actionTypes.USER_SIGNOUT: {
            return Object.assign({}, state, {
                signOutLoading: true
            });
        }

        case actionTypes.USER_SIGNOUT_SUCCESS: {
            return Object.assign({}, state, {
                userId: null,
                userToken: ""
            });
        }

        case actionTypes.USER_SIGNOUT_ERROR: {
            return {
                signOutLoading: false,
                signOutError: action.errorMsg
            };
        }

        case actionTypes.VERIFY_USER_EMAIL: {
            return Object.assign({}, state, {
                verifyEmailLoading: true
            });
        }

        case actionTypes.VERIFY_USER_EMAIL_SUCCESS: {
            return Object.assign({}, state, {
                verifyEmailLoading: false,
                verifyEmailError: null
            });
        }

        case actionTypes.VERIFY_USER_EMAIL_ERROR: {
            return Object.assign({}, state, {
                verifyEmailLoading: false,
                verifyEmailError: action.errorMsg
            });
        }

        case actionTypes.SEND_USER_PASSWORD_RESET_LINK: {
            return Object.assign({}, state, {
                sendResetLinkLoading: true
            });
        }

        case actionTypes.SEND_USER_PASSWORD_RESET_LINK_SUCCESS: {
            return Object.assign({}, state, {
                resetToken: action.resetToken,
                sendResetLinkLoading: false,
                sendResetLinkError: null
            });
        }

        case actionTypes.SEND_USER_PASSWORD_RESET_LINK_ERROR: {
            return Object.assign({}, state, {
                sendResetLinkLoading: false,
                sendResetLinkError: action.errorMsg
            });
        }

        case actionTypes.SEND_USER_PASSWORD_RESET_LINK_ERROR_RESET: {
            return Object.assign({}, state, {
                sendResetLinkError: null
            });
        }

        case actionTypes.RESET_USER_PASSWORD: {
            return Object.assign({}, state, {
                resetPasswordLoading: true
            });
        }

        case actionTypes.RESET_USER_PASSWORD_SUCCESS: {
            return Object.assign({}, state, {
                resetPasswordLoading: false,
                resetPasswordError: null
            });
        }

        case actionTypes.RESET_USER_PASSWORD_ERROR: {
            return Object.assign({}, state, {
                resetPasswordLoading: false,
                resetPasswordError: action.errorMsg
            });
        }

        case actionTypes.UPDATE_USER_PASSWORD: {
            return state;
        }

        case actionTypes.UPDATE_USER_PASSWORD_SUCCESS: {
            return state;
        }

        case actionTypes.UPDATE_USER_PASSWORD_ERROR: {
            return state;
        }

        case actionTypes.UPDATE_USER_2FA: {
            return state;
        }

        case actionTypes.UPDATE_USER_2FA_SUCCESS: {
            const newAuthyState = {};
            newAuthyState[action.data.option] = action.data.operation;
            return Object.assign({}, state, {
                resetPasswordLoading: false,
                resetPasswordError: action.errorMsg,
                userData: {
                    ...state.userData,
                    authy: {
                        ...state.userData.authy,
                        ...newAuthyState
                    }
                }
            });
        }

        case actionTypes.UPDATE_USER_2FA_ERROR: {
            return state;
        }

        case actionTypes.GET_USER_REFERRAL: {
            return state;
        }

        case actionTypes.GET_USER_REFERRAL_SUCCESS: {
            return Object.assign({}, state, action.data);
        }

        case actionTypes.GET_USER_REFERRAL_ERROR: {
            return state;
        }

        case actionTypes.UPDATE_USER_PROFILE: {
            return Object.assign({}, state, {
                updateProfileLoading: true
            });
        }

        case actionTypes.UPDATE_USER_PROFILE_SUCCESS: {
            return Object.assign({}, state, {
                updateProfileLoading: false,
                updateProfileError: null,
                userData: {
                    ...state.userData,
                    ...action.data
                }
            });
        }

        case actionTypes.UPDATE_USER_PROFILE_ERROR: {
            return Object.assign({}, state, {
                updateProfileLoading: false,
                updateProfileError: action.errorMsg
            });
        }

        case actionTypes.SET_OPT_IN: {
            return Object.assign({}, state, {
                setOptInLoading: true
            });
        }

        case actionTypes.SET_OPT_IN_SUCCESS: {
            return Object.assign({}, state, {
                setOptInLoading: false,
                setOptInError: null,
                userData: {
                    ...state.userData,
                    optIn: action.data
                }
            });
        }

        case actionTypes.SET_OPT_IN_ERROR: {
            return Object.assign({}, state, {
                setOptInLoading: false,
                setOptInError: action.errorMsg
            });
        }

        case actionTypes.AIRDROP_SUCCESS: {
            // console.log(action.data)
            return Object.assign({}, state, {
                userData: {
                    ...state.userData,
                    isAirdrop: action.data.isAirdrop
                }
            });
        }

        case "persist/REHYDRATE": {
            return Object.assign({}, state, {
                userData: ((action.payload || {}).userReducer || {}).userData,
                userId: ((action.payload || {}).userReducer || {}).userId,
                userToken: ((action.payload || {}).userReducer || {}).userToken,
                referralWallet: ((action.payload || {}).userReducer || {}).referralWallet
            });
        }

        default: {
            return state;
        }
    }
}

export default userReducer;
