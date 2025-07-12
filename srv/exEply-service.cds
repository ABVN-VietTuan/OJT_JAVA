using { Employment as external } from './external/Employment';
using {sap.capire.employee as db} from '../db/eply-model';
using { Candidate as external2 } from './external/Candidate';
service ExternalService @(path: 'external'){
    entity Employee as projection on external.EmpEmployment;
    entity Candidate as projection on external2.Candidate ;
    entity Employees   as projection on db.Employees;
}