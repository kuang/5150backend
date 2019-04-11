<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

/** Route that returns all of the rows in the projects table */
Route::get('/displayAllProjects', function () {
    return DB::table("projects")->get();
});

/** Route that returns all of the rows in the resources table */
Route::get('/displayAllResources', function() {
    return DB::table("resources")->get();
});

/** Route that returns all of the rows in the resources_per_projects table */
Route::get('/displayResourcesPerProject', function() {
    return DB::table('resources_per_projects')->get();
});

/** Route that returns all of the rows in the schedules table */
Route::get('/displaySchedules', function() {
    return DB::table('schedules')->get();
});

/** Route that adds a new project to the projects table via POST Request
 * ProjectID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "ProjectName": "P2",
    "Technology": "T2",
    "EstMaxHours": 48,
    "Status": "Done",
    "StartDate": "2019-03-07",
    "DueDate": "2019-03-14"
}

*/
Route::post("/addProject", function(Request $request) {
    $data = $request->all();

    try {
        DB::table('projects')->insertGetId(
        ["ProjectID" => 0, "ProjectName" => $data["ProjectName"],
            "Technology" => $data["Technology"], "EstMaxHours" => $data["EstMaxHours"],
            "Status" => $data["Status"],"StartDate" => date_create($data["StartDate"]),
            "DueDate" => date_create($data["DueDate"])]
        );
        return "Successfully Added New Project";
    } catch (Exception $e){
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'A project already exists with this name';
        } else {
            return 'This project could not be added. Please try again.';
        }
    }
});

/** Route that adds a new resource to the resources table via POST Request
 * ResourceID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "NetID": "jd111",
    "FirstName": "John",
    "LastName": "Doe",
    "MaxHoursPerWeek": 40
}

*/
Route::post('/addResource', function(Request $request) {
    $data = $request->all();

    try {
        DB::table('resources')->insertGetId(
        ["ResourceID" => 0, "NetID" => $data["NetID"], "FirstName" => $data["FirstName"], "LastName" => $data["LastName"],
            "MaxHoursPerWeek" => $data["MaxHoursPerWeek"]]);
        return "Successfully Added New Resource";
    } catch (Exception $e){
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'A resource already exists with this netID';
        } else {
            return 'This resource could not be added. Please try again.';
        }
    }  
});

/** Route that adds a new entry to the resources_per_projects table via POST request
 * ResourceID, ProjectID, ScheduleID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "ProjectName": "P2",
    "NetID": "jd111",
    "Role": "Product Manager"
}

 */
Route::post('/addResourcePerProject', function(Request $request) {
    $data = $request->all();
    
    try {
        $project_id_array = DB::table('projects')->select('ProjectID')->where('ProjectName', '=', $data["ProjectName"])->get();
        $project_id_json = json_decode(json_encode($project_id_array{0}), true);
        $project_id = $project_id_json["ProjectID"];

        $resource_id_array = DB::table('resources')->select('ResourceID')->where('NetID', '=', $data["NetID"])->get();
        $resource_id_json = json_decode(json_encode($resource_id_array{0}), true);
        $resource_id = $resource_id_json["ResourceID"];

        DB::table('resources_per_projects')->insertGetId(
            ["ResourceID" => $resource_id, "ProjectID" => $project_id, "Role" => $data["Role"], "ScheduleID" => 0]);
        return ("Sucessfully Added New ResourcePerProject");
    } catch (Exception $e){
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'This resource is already working on this project';
        } else {
            return 'The resource could not be added to this project. Please try again.';
        }
    }  
});

/** Route that adds a new entry to the schedules table
 * ScheduleID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "ProjectName": "P2",
    "NetID": "jd111",
    "Dates": "2019-03-07",
    "HoursPerWeek": 30
}

 */
Route::post('/addSchedule', function(Request $request) {
   $data = $request->all();
    try {
        $project_id_array = DB::table('projects')->select('ProjectID')->where('ProjectName', '=', $data["ProjectName"])->get();
        $project_id_json = json_decode(json_encode($project_id_array{0}), true);
        $project_id = $project_id_json["ProjectID"];

        $resource_id_array = DB::table('resources')->select('ResourceID')->where('NetID', '=', $data["NetID"])->get();
        $resource_id_json = json_decode(json_encode($resource_id_array{0}), true);
        $resource_id = $resource_id_json["ResourceID"];

        $schedule_id_array = DB::table('resources_per_projects')->select('ScheduleID')->where([['ProjectID', '=', $project_id], ['ResourceID', '=', $resource_id]])->get();
        $schedule_id_json = json_decode(json_encode($schedule_id_array{0}), true);
        $schedule_id = $schedule_id_json["ScheduleID"];

        DB::table('schedules')->insertGetId(
           ["ScheduleID" => $schedule_id, "Dates" => date_create($data["Dates"]), "HoursPerWeek" => $data["HoursPerWeek"]]);
        return "Successfully Added New Schedule";
   } catch (Exception $e){
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'This resource is already working on this project';
        } else {
            return 'The resource could not be added to this project. Please try again.';
        }
    }  
});

/** Route that updates a project in the projects table
 * ProjectID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "OldProjectName": "P2",
    "NewProjectName": "P2'",
    "Technology": "T2",
    "EstMaxHours": 48,
    "Status": "Done",
    "StartDate": "2019-03-07",
    "DueDate": "2019-03-14"
}

*/
Route::put('/updateProject', function(Request $request) {
    $data = $request->all();
    try {
        DB::table('projects')->where('ProjectName', $data["OldProjectName"])->update(
        ["ProjectName" => $data["NewProjectName"], "Technology" => $data["Technology"],
        "EstMaxHours" => $data["EstMaxHours"], "Status" => $data["Status"],
        "StartDate" => $data["StartDate"], "DueDate" => $data["DueDate"]]);
        return "Successfully Updated Existing Project";
    } catch (Exception $e){
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'A project already exists with this name';
        } else {
            return 'This project could not be updated. Please try again.';
        }
    }
});

/** Route that updates a resource in the resources table
 * ResourceID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "OldNetID": "jd111",
    "NewNetID": "jd111",
    "FirstName": "John",
    "LastName": "Doe",
    "MaxHoursPerWeek": 40
}

*/
Route::put('/updateResource', function(Request $request) {
    $data = $request->all();
    try {
        DB::table('resources')->where('NetID', $data["OldNetID"])->update(
        ["NetID" => $data["NewNetID"], "FirstName" => $data["FirstName"],
        "LastName" => $data["LastName"], "MaxHoursPerWeek" => $data["MaxHoursPerWeek"]]);
        return "Successfully Updated Existing Resource";
    } catch (Exception $e){
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'A resource already exists with this netID';
        } else {
            return 'This resource could not be updated. Please try again.';
        }
    }  
});

/** Route that updates an entry to the resources_per_projects table
 * ResourceID, ProjectID, ScheduleID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "ProjectName": "P2",
    "NetID": "jd111",
    "Role": "Product Manager"
}

 */
Route::put('/updateResourcePerProject', function(Request $request) {
    $data = $request->all();
    
    $project_id_array = DB::table('projects')->select('ProjectID')->where('ProjectName', '=', $data["ProjectName"])->get();
    $project_id_json = json_decode(json_encode($project_id_array{0}), true);
    $project_id = $project_id_json["ProjectID"];

    $resource_id_array = DB::table('resources')->select('ResourceID')->where('NetID', '=', $data["NetID"])->get();
    $resource_id_json = json_decode(json_encode($resource_id_array{0}), true);
    $resource_id = $resource_id_json["ResourceID"];

    try {
        DB::table('resources_per_projects')->where([['ProjectID', $project_id], ['ResourceID', $resource_id]])->update(
        ["Role" => $data["Role"]]);
        return "Successfully Updated Existing ResourcePerProject";
    } catch (Exception $e){
        echo($e->getMessage());
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'This resource already exists on this project';
        } else {
            return 'This resource could not be updated. Please try again.';
        }
    }  
});

/** Route that updates an entry to the schedules table
 * ScheduleID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "ProjectName": "P2",
    "NetID": "jd111",
    "Dates": "2019-03-07",
    "HoursPerWeek": 30
}

 */
Route::put('/updateSchedule', function(Request $request) {
    $data = $request->all();
    
    $project_id_array = DB::table('projects')->select('ProjectID')->where('ProjectName', '=', $data["ProjectName"])->get();
    $project_id_json = json_decode(json_encode($project_id_array{0}), true);
    $project_id = $project_id_json["ProjectID"];

    $resource_id_array = DB::table('resources')->select('ResourceID')->where('NetID', '=', $data["NetID"])->get();
    $resource_id_json = json_decode(json_encode($resource_id_array{0}), true);
    $resource_id = $resource_id_json["ResourceID"];

    $schedule_id_array = DB::table('resources_per_projects')->select('ScheduleID')->where([['ProjectID', '=', $project_id], ['ResourceID', '=', $resource_id]])->get();
    $schedule_id_json = json_decode(json_encode($schedule_id_array{0}), true);
    $schedule_id = $schedule_id_json["ScheduleID"];

    try {
        DB::table('schedules')->where('ScheduleID', $schedule_id)->update(
        ["Dates" => $data["Dates"], "HoursPerWeek" => $data["HoursPerWeek"]]);
        return "Successfully Updated Existing Schedule";
    } catch (Exception $e){
        echo($e->getMessage());
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'This schedule already exists';
        } else {
            return 'This resource could not be updated. Please try again.';
        }
    }  
});

/** Route that deletes a  project in the projects table 
 * ProjectID: auto-incrementing key, so value that is inputted for it does not matter 

{
    "ProjectName": "P2"
}

*/
Route::delete("/deleteProject", function(Request $request) {
    $data = $request->all();

    try {
        // Removing Resources Per Projects
        $project_id_array = DB::table('projects')->select('ProjectID')->where('ProjectName', '=', $data["ProjectName"])->get();
        $project_id_json = json_decode(json_encode($project_id_array{0}), true);
        $project_id = $project_id_json["ProjectID"];

        $matching_schedules = DB::table('resources_per_projects')->where("ProjectID", "=", $project_id)->pluck('ScheduleID');

        foreach ($matching_schedules as $scheduleID) {
            DB::table('schedules')->where("ScheduleID" , "=", $scheduleID)->delete();
        }

        DB::table('resources_per_projects')->where("ProjectID", "=", $project_id)->delete();

        return "Successfully Deleted Existing Project";
    } catch (Exception $e){
        echo($e->getMessage());
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'A project does not exist with this name';
        } else {
            return 'This project could not be deleted. Please try again.';
        }
    }
});

/** Route that deletes a  project in the projects table
 * ProjectID: auto-incrementing key, so value that is inputted for it does not matter

{

"NetID": "jd111"
}
 *

 */
Route::delete("/deleteResource", function(Request $request) {
    $data = $request->all();
    try {
        $resource_id_array = DB::table('resources')->select('ResourceID')->where('NetID', '=', $data["NetID"])->get();
        $resource_id_json = json_decode(json_encode($resource_id_array{0}), true);
        $resource_id = $resource_id_json["ResourceID"];

        $matching_schedules = DB::table('resources_per_projects')->where("ResourceID", "=", $resource_id)->pluck('ScheduleID');

        foreach ($matching_schedules as $scheduleID) {
            DB::table('schedules')->where("ScheduleID", "=", $scheduleID)->delete();
        }

        DB::table('resources_per_projects')->where("ResourceID", "=", $resource_id)->delete();
        return "Successfully Deleted Resource";
        
    } catch (Exception $e){
        echo($e->getMessage());
        $error_code = $e->errorInfo[1];
        if($error_code == 1062){
            return 'A resource does not exist with this NetID';
        } else {
            return 'This resource could not be deleted. Please try again.';
        }
    }
});

/** Route that clears all records from all tables */
// Route::get('/clear', function() {
//     DB::table('schedules')->delete();
//     DB::table('resources_per_projects')->delete();
//     DB::table('resources')->delete();
//     DB::table('projects')->delete();
//     return('Database cleared successfully');
// });
