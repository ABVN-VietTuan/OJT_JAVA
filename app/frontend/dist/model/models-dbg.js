sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    function (JSONModel, Device) {
        "use strict";

        return {
            /**
             * Provides runtime information for the device the UI5 app is running on as a JSONModel.
             * @returns {sap.ui.model.json.JSONModel} The device model.
             */
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            async createUserModel() {
                try {
                    const response = await fetch("/user-api/attributes", {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch user attributes: " + response.status);
                    }

                    const data = await response.json();
                    const scopes = data.scopes || [];
                    const isAdmin = scopes.some(scope => scope.includes("Admin")); // Adjust scope check if needed

                    return new sap.ui.model.json.JSONModel({
                        email: data.email,
                        fullName: `${data.firstname} ${data.lastname}`,
                        isAdmin: isAdmin
                    });
                } catch (err) {
                    console.error("Error fetching user attributes:", err);
                    return new sap.ui.model.json.JSONModel({ isAdmin: false });
                }
            },
        };
    });