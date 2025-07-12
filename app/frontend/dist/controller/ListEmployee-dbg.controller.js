sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",

], (Controller, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("frontend.controller.ListEmployee", {
        onInit() {
            let oData;
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("ListEmployee").attachPatternMatched(this._onRouteMatched, this);

            const oUserModel = this.getOwnerComponent().getModel("user");
            console.log(oUserModel);

            // oUserModel.attachRequestCompleted(() => {
            //     oData = oUserModel.getData();
            //     console.log("User model data:", oData);
            //     // Now safe to access
            //     const isAdmin = oData?.scopes && oData?.scopes.some(s => s.includes("Admin"));
            //     console.log("Check is Admin", isAdmin);

            //     this.byId("submitBtn").setVisible(isAdmin);
            //     this.byId("deleteBtn").setVisible(isAdmin);
            // });
            oData = oUserModel.getData();
            console.log("User model data:", oData);
            // Now safe to access
            const isAdmin = oData?.scopes && oData?.scopes.some(s => s.includes("Admin"));
            console.log("Check is Admin", isAdmin);

            this.byId("submitBtn").setVisible(isAdmin);
            this.byId("deleteBtn").setVisible(isAdmin);


        },
        _onRouteMatched: function () {
            const oTable = this.byId("employeeTable");
            const oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.refresh();
            }
        },
        onRowPress: function (oEvent) {
            // Get the selected row/item from the table event
            const oItem = oEvent.getParameter("listItem");

            // Get the binding context for the correct model name ('employee')
            const oCtx = oItem.getBindingContext("employee");

            // Use getProperty to extract the ID (adjust to match your actual ID field, probably just 'ID')
            const sEmployeeId = encodeURIComponent(oCtx.getProperty("ID"));
            console.log("hello", sEmployeeId);

            // Navigate to the detail page with the selected EmployeeId as a parameter
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("DetailEmployee", { employeeId: sEmployeeId });
        },
        onAddEmployee: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("CreateEmployee"); // Navigate to the new create view
        },
        onRemoveEmployee: async function (oEvent) {
            // var oSelected = this.byId("employeeTable").getSelectedItem();
            // console.log(oSelected);

            // if (oSelected) {
            //     var oEmployee = oSelected.getBindingContext("employee").getObject().firstName;
            //     console.log("hello", oEmployee);

            //     oSelected.getBindingContext("employee").delete().then(function () {
            //         MessageToast.show(oEmployee + " deleted successfully!");
            //     }.bind(this), function (oError) {
            //         MessageToast.show("Deletion error: ", oError);
            //     });
            // } else {
            //     MessageToast.show("Please select a row to delete");
            // }
            // Get the Button's parent row (ColumnListItem)
            const oButton = oEvent.getSource();
            const oItem = oButton.getParent();

            // Get the binding context for the 'employee' model
            const oCtx = oItem.getBindingContext("employee");

            if (!oCtx) {
                MessageBox.error("Unable to determine the selected employee.");
                return;
            }

            // Confirm before deleting
            const bConfirmed = await new Promise((resolve) => {
                MessageBox.confirm(
                    "Are you sure you want to delete this employee?",
                    {
                        title: "Confirm Delete",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: (sAction) => resolve(sAction === MessageBox.Action.YES)
                    }
                );
            });

            if (!bConfirmed) {
                return; // User cancelled
            }

            try {
                // Delete the context → triggers delete request
                await oCtx.delete();

                // Show success
                MessageToast.show("Employee deleted successfully.");
            } catch (err) {
                console.error("Delete failed:", err);
                MessageBox.error("Failed to delete employee.");
            }
        }
    });
});