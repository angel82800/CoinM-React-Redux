import axios from "axios";
import qs from "qs";
import ReactPixel from "react-facebook-pixel";
import { hashHistory } from "react-router";

import * as actionTypes from "../../constants/ActionTypes";
import TwoFactorActions from "../twoFactor/actions";
import { pushToGTM } from "../../constants/Helpers";

axios.defaults.baseURL = process.env.REACT_APP_API_URI;
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

const FomoClient = require("fomo-nodejs-sdk");
const client = new FomoClient("nkzcv5vapXebxJgRsOnIsQ");

const setBearerToken = (token) => {
    // add Bearer token to common axios request header
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

const config = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
};

const AccountActions = {
    acceptErrorResponse: function (error, dispatch, token) {
        if (((error || {}).response || {}).status === 401)
            return dispatch(this.signOut(token));
    },

    login: function (data) {
        return (dispatch) => {
            dispatch(this.loginStart());

            data.login = data.login.trim();

            return axios.post("jwt", qs.stringify(data))
                .then((response) => {
                    if (response.status === 202 && response.data.data.message.match(/2FA/))
                        return dispatch(TwoFactorActions.twoFactorAuthStart(this.login, this, [data]));

                    let userId = response.data.data.userId;
                    let token = response.data.data.token;

                    pushToGTM({ "event": "cm-login" }, "loginEvent");

                    localStorage.setItem("jwtToken", token);

                    dispatch(this.loginSuccess(token, userId));
                    return dispatch(this.fetchCurrentUser(token));
                })
                .catch((error) => {
                    if (error && error.response) {
                        dispatch(this.loginError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.loginError(error && error.message));
                        return Promise.reject({ message: error && error.message });
                    }
                });
        };
    },

    loginStart: function () {
        return {
            type: actionTypes.USER_LOGIN,
        };
    },

    loginSuccess: function (token, userId) {
        return {
            type: actionTypes.USER_LOGIN_SUCCESS,
            token,
            userId
        };
    },

    loginError: function (errorMsg) {
        return {
            type: actionTypes.USER_LOGIN_ERROR,
            errorMsg
        };
    },

    loginErrorReset: function () {
        return {
            type: actionTypes.USER_LOGIN_ERROR_RESET
        };
    },

    signUp: function (data) {
        return (dispatch) => {
            dispatch(this.signUpStart());

            data.email = data.email.trim();

            return axios.post("signup", qs.stringify(data))
                .then((response) => {
                    dispatch(this.signUpSuccess());

                    pushToGTM({ "event": "cm-signup" }, "signupEvent");

                    let basicEvent = client.FomoEventBasic();
                    basicEvent.event_type_id = "50318";
                    basicEvent.title = "Signup event";
                    basicEvent.email_address = data.email;
                    basicEvent.url = "https://go.coinmetro.com";
                    basicEvent.addCustomEventField("username", data.firstname);

                    if (process.env.NODE_ENV === "production")
                        client.createEvent(basicEvent);
                })
                .catch((error) => {
                    if ((error || {}).response) {
                        dispatch(this.signUpError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.signUpError((error || {}).message));
                        return Promise.reject({ message: (error || {}).message });
                    }
                });
        };
    },

    signUpStart: function () {
        return {
            type: actionTypes.USER_SIGNUP,
        };
    },

    signUpSuccess: function () {
        return {
            type: actionTypes.USER_SIGNUP_SUCCESS,
        };
    },

    signUpError: function (errorMsg) {
        return {
            type: actionTypes.USER_SIGNUP_ERROR,
            errorMsg
        };
    },

    signUpErrorReset: function () {
        return {
            type: actionTypes.USER_SIGNUP_ERROR_RESET
        };
    },

    fetchCurrentUser: function (token) {
        return (dispatch) => {
            dispatch(this.fetchCurrentUserStart());

            setBearerToken(token);

            return axios.get("account/profile")
                .then((response) => {
                    dispatch(this.fetchCurrentUserSuccess(response.data.data));
                })
                .catch((error) => {
                    this.acceptErrorResponse(error, dispatch, token);

                    if ((error || {}).response) {
                        dispatch(this.fetchCurrentUserError(error.response.data.response.errors.message));
                    } else {
                        dispatch(this.fetchCurrentUserError(error.message));
                    }
                });
        };
    },

    fetchCurrentUserStart: function () {
        return {
            type: actionTypes.FETCH_CURRENT_USER
        };
    },

    fetchCurrentUserSuccess: function (data) {
        return {
            type: actionTypes.FETCH_CURRENT_USER_SUCCESS,
            data
        };
    },

    fetchCurrentUserError: function (errorMsg) {
        return {
            type: actionTypes.FETCH_CURRENT_USER_ERROR,
            errorMsg
        };
    },

    signOut: function (token) {
        return (dispatch) => {
            dispatch(this.signOutStart());

            setBearerToken(token);

            return axios.put("jwt", config)
                .then(() => dispatch(this.signOutSuccess()))
                .catch((error) => {
                    if ((error || {}).response) {
                        dispatch(this.signOutError(error.response.data.response.errors.message));
                    }
                })
                .catch((error) => console.log(error))
                .then(() => {
                    localStorage.removeItem("jwtToken");
                    hashHistory.push("#/account/login");
                });
        };
    },

    signOutStart: function () {
        return {
            type: actionTypes.USER_SIGNOUT
        };
    },

    signOutSuccess: function () {
        return {
            type: actionTypes.USER_SIGNOUT_SUCCESS
        };
    },

    signOutError: function (errorMsg) {
        return {
            type: actionTypes.USER_SIGNOUT_ERROR,
            errorMsg
        };
    },

    verifyEmail: function (token) {
        return (dispatch) => {
            dispatch(this.verifyEmailStart());

            const data = {
                token: token
            };

            return axios.post("verify/email", qs.stringify(data))
                .then(() => {
                    dispatch(this.verifyEmailSuccess());
                })
                .catch((error) => {
                    if ((error || {}).response) {
                        dispatch(this.verifyEmailError(error.response.data.response.errors.message));
                    } else {
                        dispatch(this.verifyEmailError(error.message));
                    }
                });
        };
    },

    verifyEmailStart: function () {
        return {
            type: actionTypes.VERIFY_USER_EMAIL,
        };
    },

    verifyEmailSuccess: function () {
        return {
            type: actionTypes.VERIFY_USER_EMAIL_SUCCESS,
        };
    },

    verifyEmailError: function (errorMsg) {
        return {
            type: actionTypes.VERIFY_USER_EMAIL_ERROR,
            errorMsg
        };
    },

    sendResetLink: function (data) {
        return (dispatch) => {
            dispatch(this.sendResetLinkStart());

            data.email = data.email.trim();

            return axios.post("password/reset", qs.stringify(data))
                .then((response) => {
                    dispatch(this.sendResetLinkSuccess(response.data.data.resetToken));
                    return response.data.data.message;
                })
                .catch((error) => {
                    if ((error || {}).response) {
                        dispatch(this.sendResetLinkError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.sendResetLinkError((error || {}).message));
                        return Promise.reject({ message: (error || {}).message });
                    }
                });
        };
    },

    sendResetLinkStart: function () {
        return {
            type: actionTypes.SEND_USER_PASSWORD_RESET_LINK
        };
    },

    sendResetLinkSuccess: function (resetToken) {
        return {
            type: actionTypes.SEND_USER_PASSWORD_RESET_LINK_SUCCESS,
            resetToken
        };
    },

    sendResetLinkError: function (errorMsg) {
        return {
            type: actionTypes.SEND_USER_PASSWORD_RESET_LINK_ERROR,
            errorMsg
        }
    },

    sendResetLinkErrorReset: function () {
        return {
            type: actionTypes.SEND_USER_PASSWORD_RESET_LINK_ERROR_RESET
        }
    },

    update2FA: function (data, token) {
        return (dispatch) => {
            dispatch(this.update2FAStart());

            setBearerToken(token);

            let op;
            if (data.operation)
                op = axios.post("account/2FA/" + data.option, qs.stringify(data), config);
            else
                op = axios.put("account/2FA/" + data.option, qs.stringify(data), config);

            return op.then((response) => {
                if (response.status === 202 && response.data.data.message.match(/2FA/)) {
                    const tfa = dispatch(TwoFactorActions.twoFactorAuthStart(this.update2FA, this, [data, token]));

                    if (!data.operation)
                        return tfa;
                }

                return dispatch(this.update2FASuccess(data));
            })
                .catch((error) => {
                    this.acceptErrorResponse(error, dispatch, token);
                    if ((error || {}).response) {
                        dispatch(this.update2FAError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.update2FAError(error && error.message));
                        return Promise.reject({ message: error && error.message });
                    }
                });
        };
    },

    update2FAStart: function () {
        return {
            type: actionTypes.UPDATE_USER_2FA
        };
    },

    update2FASuccess: function (data) {
        return {
            type: actionTypes.UPDATE_USER_2FA_SUCCESS,
            data
        };
    },

    update2FAError: function (errorMsg) {
        return {
            type: actionTypes.UPDATE_USER_2FA_ERROR,
            errorMsg
        }
    },

    updatePassword: function (data, token, userId) {
        return (dispatch) => {
            dispatch(this.updatePasswordStart());

            setBearerToken(token);

            return axios.put("account/password", qs.stringify(data), config)
                .then((response) => {
                    if (response.status === 202 && response.data.data.message.match(/2FA/))
                        return dispatch(TwoFactorActions.twoFactorAuthStart(this.updatePassword, this, [data, token, userId]));

                    return dispatch(this.updatePasswordSuccess());
                })
                .catch((error) => {
                    this.acceptErrorResponse(error, dispatch, token);
                    if ((error || {}).response) {
                        dispatch(this.updatePasswordError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.updatePasswordError(error && error.message));
                        return Promise.reject({ message: error && error.message });
                    }
                });
        };
    },

    updatePasswordStart: function () {
        return {
            type: actionTypes.UPDATE_USER_PASSWORD
        };
    },

    updatePasswordSuccess: function () {
        return {
            type: actionTypes.UPDATE_USER_PASSWORD_SUCCESS
        };
    },

    updatePasswordError: function (errorMsg) {
        return {
            type: actionTypes.UPDATE_USER_PASSWORD_ERROR,
            errorMsg
        }
    },

    resetPassword: function (data) {
        return (dispatch) => {
            dispatch(this.resetPasswordStart());

            return axios.put("password/reset", qs.stringify(data), config)
                .then((response) => {
                    if (response.status === 202 && response.data.data.message.match(/2FA/))
                        return dispatch(TwoFactorActions.twoFactorAuthStart(this.resetPassword, this, [data]));

                    dispatch(this.resetPasswordSuccess());
                })
                .catch((error) => {
                    if (error && error.response) {
                        dispatch(this.resetPasswordError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.resetPasswordError(error && error.message));
                        return Promise.reject({ message: error && error.message });
                    }
                });
        };
    },

    resetPasswordStart: function () {
        return {
            type: actionTypes.RESET_USER_PASSWORD
        };
    },

    resetPasswordSuccess: function () {
        return {
            type: actionTypes.RESET_USER_PASSWORD_SUCCESS
        };
    },

    resetPasswordError: function (errorMsg) {
        return {
            type: actionTypes.RESET_USER_PASSWORD_ERROR,
            errorMsg
        }
    },

    getUserReferral: function (userId, token) {
        return (dispatch) => {
            dispatch(this.getUserReferralStart());

            setBearerToken(token);

            return axios.get("users/referral")
                .then((response) => {
                    dispatch(this.getUserReferralSuccess(response.data.data));
                })
                .catch((error) => {
                    this.acceptErrorResponse(error, dispatch, token);

                    if (error && error.response) {
                        dispatch(this.getUserReferralError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.getUserReferralError(error && error.message));
                        return Promise.reject({ message: error && error.message });
                    }
                });
        };
    },

    getUserReferralStart: function () {
        return {
            type: actionTypes.GET_USER_REFERRAL
        };
    },

    getUserReferralSuccess: function (data) {
        return {
            type: actionTypes.GET_USER_REFERRAL_SUCCESS,
            data
        };
    },

    getUserReferralError: function (errorMsg) {
        return {
            type: actionTypes.GET_USER_REFERRAL_ERROR,
            errorMsg
        }
    },

    updateUserProfile: function (data, token, userId) {
        return (dispatch) => {
            dispatch(this.updateUserProfileStart());

            setBearerToken(token);

            return axios.put("account/profile", qs.stringify(data), config)
                .then((response) => {
                    if (response.status === 202 && response.data.data.message.match(/2FA/)) {
                        return dispatch(TwoFactorActions.twoFactorAuthStart(this.updateUserProfile, this, [data, token, userId]));
                    }

                    return dispatch(this.updateUserProfileSuccess(response.data.data));
                })
                .catch((error) => {
                    this.acceptErrorResponse(error, dispatch, token);
                    if (error && error.response) {
                        dispatch(this.updateUserProfileError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.updateUserProfileError(error && error.message));
                        return Promise.reject({ message: error && error.message });
                    }
                });
        };
    },

    updateUserProfileStart: function () {
        return {
            type: actionTypes.UPDATE_USER_PROFILE
        };
    },

    updateUserProfileSuccess: function (data) {
        return {
            type: actionTypes.UPDATE_USER_PROFILE_SUCCESS,
            data
        };
    },

    updateUserProfileError: function (errorMsg) {
        return {
            type: actionTypes.UPDATE_USER_PROFILE_ERROR,
            errorMsg
        }
    },

    setOptIn: function (token, data) {
        return (dispatch) => {
            dispatch(this.setOptInStart());

            setBearerToken(token);

            return axios.post("account/optin", qs.stringify(data), config)
                .then((response) => {
                    return dispatch(this.setOptInSuccess(data.optIn));
                })
                .catch((error) => {
                    this.acceptErrorResponse(error, dispatch, token);
                    if (error && error.response) {
                        dispatch(this.setOptInError(error.response.data.response.errors.message));
                        return Promise.reject({ message: error.response.data.response.errors.message });
                    } else {
                        dispatch(this.setOptInError(error && error.message));
                        return Promise.reject({ message: error && error.message });
                    }
                });
        };
    },

    verifyAirdropSuccess: function (data) {
        return {
            type: actionTypes.AIRDROP_SUCCESS,
            data
        };
    },

    setOptInStart: function () {
      return {
          type: actionTypes.SET_OPT_IN
      };
    },
    
    setOptInSuccess: function (data) {
        return {
            type: actionTypes.SET_OPT_IN_SUCCESS,
            data
        };
    },

    setOptInError: function (errorMsg) {
        return {
            type: actionTypes.SET_OPT_IN_ERROR,
            errorMsg
        }
    }
};

export default AccountActions;
