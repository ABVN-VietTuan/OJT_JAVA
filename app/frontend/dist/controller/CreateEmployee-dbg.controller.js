sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
], (Controller, History, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("frontend.controller.CreateEmployee", {
        onInit() {
            // Create a new JSONModel to hold employee data temporarily
            const oNewEmployeeModel = new sap.ui.model.json.JSONModel({
                firstName: "",
                lastName: "",
                email: "",
                gender: "Male",
                dateOfBirth: "",
                hireDate: "",
                role_ID: "",
                department_ID: ""
            });

            this.getView().setModel(oNewEmployeeModel, "newEmployee");
        },
        onNavBack: function () {
            console.log("hello");

            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("ListEmployee", {}, true);
            }
        },
        onCreateEmployee: async function () {
            // Get your JSON model holding the new employee form data
            const oNewEmployeeModel = this.getView().getModel("newEmployee");
            const oNewEmployee = oNewEmployeeModel.getData();

            // Validate or reformat dates
            if (oNewEmployee.dateOfBirth instanceof Date) {
                oNewEmployee.dateOfBirth = oNewEmployee.dateOfBirth.toISOString().split("T")[0];
            }
            if (oNewEmployee.hireDate instanceof Date) {
                oNewEmployee.hireDate = oNewEmployee.hireDate.toISOString().split("T")[0];
            }
            console.log(oNewEmployee);

            // Get your OData V4 model 
            const oModel = this.getView().getModel("employee");

            // Validate mandatory fields
            if (!oNewEmployee.firstName || !oNewEmployee.lastName || !oNewEmployee.email) {
                MessageBox.warning("Please fill in First Name, Last Name, and Email.");
                return;
            }

            try {
                // Bind to /Employees entity set
                const oListBinding = oModel.bindList("/Employees");

                // Create new context (creates entity locally + triggers create request)
                const oContext = oListBinding.create(oNewEmployee);

                // Wait until creation is confirmed by backend
                await oContext.created();
                console.log("check");

                MessageToast.show("Employee created successfully!", {
                    width: "15em",                   // default
                    my: "center center",             // default
                    at: "center center",             // default
                    of: window,                      // default
                    offset: "0 0",                   // default
                    collision: "fit fit",            // default
                    onClose: null,                   // default
                    autoClose: true,                 // default
                    animationTimingFunction: "ease", // default
                    animationDuration: 1000,         // default
                    closeOnBrowserNavigation: true   // default
                });

                // Navigate back to employee list
                this.getOwnerComponent().getRouter().navTo("ListEmployee");

            } catch (err) {
                console.error("Create failed:", err);
                MessageBox.error("Failed to create employee. Please try again.");
            }
        },
        onCalculateSalary: async function () {
            try {
                const oView = this.getView();
                const oNewData = oView.getModel("newEmployee").getData();

                let baseSalary = 3000;
                if (oNewData.role_ID) {
                    baseSalary += 500;
                }
                if (oNewData.department_ID) {
                    baseSalary += 200;
                }

                // Update model so UI refreshes
                oView.getModel("newEmployee").setProperty("/salary", baseSalary);

                MessageToast.show("Salary calculated: $" + baseSalary);
            } catch (oError) {
                console.error("Salary calculation failed:", oError);
                MessageBox.error("Failed to calculate salary.");
            }
        },

    });
});