sap.ui.define([
    "sap/ui/core/UIComponent",
    "frontend/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("frontend.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        async init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            const userModel = await models.createUserModel();
            console.log("Check user",userModel);
            this.setModel(userModel, "user");
        }
    });
});