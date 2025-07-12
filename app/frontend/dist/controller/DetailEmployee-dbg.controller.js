sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, History, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("frontend.controller.DetailEmployee", {
        onInit: function () {
            // let oData
            console.log("hello");

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("DetailEmployee").attachPatternMatched(this._onRouteMatched, this);

            const oUserModel = this.getOwnerComponent().getModel("user");
            console.log(oUserModel);

            const oUIModel = new sap.ui.model.json.JSONModel({
                isAdmin: false
            });
            this.getView().setModel(oUIModel, "ui");
            // oUserModel.attachRequestCompleted(() => {
            //     oData = oUserModel.getData();
            //     console.log("User model data:", oData);
            //     const isAdmin = oData?.scopes && oData?.scopes.some(s => s.includes("Admin"));
            //     console.log("Check isAdmin detail",isAdmin);

            //     // Directly set editable property
            //     this.byId("email").setEditable(isAdmin);
            //     this.byId("firstName").setEditable(isAdmin);
            //     this.byId("lastName").setEditable(isAdmin);
            //     this.byId("gender").setEditable(isAdmin);
            //     this.byId("dob").setEditable(isAdmin);
            //     this.byId("hireDate").setEditable(isAdmin);
            //     this.byId("role").setEditable(isAdmin);
            //     this.byId("department").setEditable(isAdmin);
            //     this.byId("editbtn").setEditable(isAdmin);
            // });
            const oData = oUserModel.getData();
            console.log("User model data:", oData);
            const isAdmin = oData?.scopes && oData?.scopes.some(s => s.includes("Admin"));
            console.log("Check isAdmin detail", isAdmin);
            this.getView().getModel("ui").setProperty("/isAdmin", isAdmin);
            // // Directly set editable property
            // this.byId("email").setEditable(isAdmin);
            // this.byId("firstName").setEditable(isAdmin);
            // this.byId("lastName").setEditable(isAdmin);
            // this.byId("gender").setEditable(isAdmin);
            // this.byId("dob").setEditable(isAdmin);
            // this.byId("hireDate").setEditable(isAdmin);
            // this.byId("role").setEditable(isAdmin);
            // this.byId("department").setEditable(isAdmin);
            this.byId("editbtn").setVisible(isAdmin);
        },

        _onRouteMatched: function (oEvent) {
            const oView = this.getView();
            const oModel = this.getOwnerComponent().getModel("employee");
            const employeeId = oEvent.getParameter("arguments").employeeId;

            // Bind the view to the employee entity
            oView.bindElement({
                path: `/Employees(${employeeId})`,
                model: "employee",
                parameters: {
                    $expand: 'role,department'
                },
                events: {
                    change: this._onBindingChange.bind(this)
                }
            });

        },

        _onBindingChange: function () {
            const oView = this.getView();
            const oElementBinding = oView.getElementBinding("employee");
            if (!oElementBinding.getBoundContext()) {
                MessageToast.show("Employee not found.");
                this.onNavBack();
            }
        },

        onCalculateSalary: function () {
            const oModel = this.getView().getModel("employee");
            const oContext = this.getView().getBindingContext("employee");
            const employeeId = oContext.getProperty("ID");

            oModel.callFunction("/calculateSalary", {
                method: "POST",
                urlParameters: {
                    employeeId: employeeId
                },
                success: function (oData) {
                    MessageToast.show("Calculated Salary: $$" + oData.value);
                },
                error: function () {
                    MessageToast.show("Failed to calculate salary.");
                }
            });
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("ListEmployee", {}, true);
            }
        },
        onEditEmployee: async function () {
            const oView = this.getView();
            const oModel = oView.getModel("employee"); // OData V4 model bound to your service
            const oContext = oView.getBindingContext("employee");

            if (!oContext) {
                MessageToast.show("No binding context available for editing.");
                return;
            }

            try {
                // Collect input values (you can adjust IDs if your controls have explicit IDs)
                const firstName = this.byId("firstName").getValue().trim();
                const lastName = this.byId("lastName").getValue().trim();
                const email = this.byId("email").getValue().trim();
                const gender = this.byId("gender").getSelectedKey();
                const roleId = this.byId("role").getSelectedKey();
                const departmentId = this.byId("department").getSelectedKey();
                const dateOfBirthValue = this.byId("dob").getDateValue();
                const hireDateValue = this.byId("hireDate").getDateValue();
                const dateOfBirth = dateOfBirthValue ? dateOfBirthValue.toISOString().split("T")[0] : null;
                const hireDate = hireDateValue ? hireDateValue.toISOString().split("T")[0] : null;
                console.log("Check gender", gender);

                // Set properties on the binding context (they are buffered in the batch group)
                const groupId = "$auto"; // Use your default group
                oContext.setProperty("firstName", firstName, groupId);
                oContext.setProperty("lastName", lastName, groupId);
                oContext.setProperty("email", email, groupId);
                oContext.setProperty("gender", gender, groupId);
                oContext.setProperty("role_ID", roleId, groupId);
                oContext.setProperty("department_ID", departmentId, groupId);
                oContext.setProperty("dateOfBirth", dateOfBirth);
                oContext.setProperty("hireDate", hireDate);

                // Submit the batch (commits all changes together)
                await oModel.submitBatch(groupId);
                MessageToast.show("Employee updated successfully.", {
                    width: "15em",                   // default
                    my: "center bottom",             // default
                    at: "center bottom",             // default
                    of: window,                      // default
                    offset: "0 0",                   // default
                    collision: "fit fit",            // default
                    onClose: null,                   // default
                    autoClose: true,                 // default
                    animationTimingFunction: "ease", // default
                    animationDuration: 1000,         // default
                    closeOnBrowserNavigation: true   // default
                });

                this.getOwnerComponent().getRouter().navTo("ListEmployee");

            } catch (err) {
                console.error("Update failed:", err);
                MessageBox.error("Failed to update employee. Please check console for details.");
            }
        }
    });
});
