namespace sap.capire.employee;

using {
  cuid,
} from '@sap/cds/common';

entity Roles : cuid {
  name       : String(50);
  baseSalary : Double;
}

entity Departments : cuid {
  name : String(50);
}

entity Employees : cuid {
  firstName  : String(50);
  lastName   : String(50);
  dateOfBirth: Date;
  gender     : String(10);
  email      : String(100);
  hireDate   : Date;
  salary     : Double; 
  role       : Association to Roles;
  department : Association to Departments;
}