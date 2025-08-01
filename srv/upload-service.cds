using {sap.capire.employee as db} from '../db/eply-model';

service UploadService @(path: 'UploadService'){
  entity UploadedCSV as projection on db.UploadedCSV;
}

annotate UploadService with @(requires: [
    'Admin',
    'Viewer'
]);
