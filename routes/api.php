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

/** Route that adds a new entry to the schedules table
 * ScheduleID: auto-incrementing key, so value that is inputted for it does not matter */
Route::get('/addSchedule', function() {
    DB::table('schedules')->insertGetId(
        ["ScheduleID" => 1, "Dates" => date_create("2019-3-24"), "HoursPerWeek" => 30]);
});

/** Route that adds a new project to the projects table via POST Request
 * ProjectID: auto-incrementing key, so value that is inputted for it does not matter */
Route::post("/addProject", function(Request $request) {
    $data = $request->all();
    DB::table('projects')->insertGetId(
        ["ProjectID" => 0, "ProjectName" => $data["ProjectName"],
            "Technology" => $data["Technology"], "EstMaxHours" => $data["EstMaxHours"],
            "Status" => $data["Status"],"StartDate" => date_create($data["StartDate"]),
            "DueDate" => date_create($data["DueDate"])]
    );
    return "Successfully Added New Project";
});

/** Route that adds a new resource to the resources table via POST Request
 * ResourceID: auto-incrementing key, so value that is inputted for it does not matter */
Route::post('/addResource', function(Request $request) {
    $data = $request->all();
    DB::table('resources')->insertGetId(
        ["ResourceID" => 0, "FirstName" => $data["FirstName"], "LastName" => $data["LastName"],
            "MaxHoursPerWeek" => $data["MaxHoursPerWeek"]]);
    return "Successfully Added New Resource";
});

/** Route that adds a new entry to the resources_per_projects table via POST request
 * ResourceID, ProjectID, ScheduleID: auto-incrementing key, so value that is inputted for it does not matter */
Route::post('/addResourcePerProject', function(Request $request) {
    $data = $request->all();
    $project_id_array = DB::table('projects')->select('ProjectID')->where('ProjectName', '=', $data["ProjectName"])->get();
    $project_id_json = json_decode(json_encode($project_id_array{0}), true);
    $project_id = $project_id_json["ProjectID"];
    // check if resource id is valid
    DB::table('resources_per_projects')->insertGetId(
        ["ResourceID" => $data["ResourceID"], "ProjectID" => $project_id, "Role" => $data["Role"], "ScheduleID" => 0]);
    return ("ResourcePerProject added successfully");
});

/** Route that adds a new entry to the schedules table
 * ScheduleID: auto-incrementing key, so value that is inputted for it does not matter */
//Route::post('/addSchedule', function(Request $request) {
//    $data = $request->all();
//    DB::table('schedules')->insertGetId(
//        ["ScheduleID" => 0, "Dates" => date_create($data["Dates"]), "HoursPerWeek" => $data["HoursPerWeek"]]);
//    return "Successfully Added New Schedule";
//});

/** Route that clears all records from all tables */
Route::get('/clear', function() {
    DB::table('schedules')->delete();
    DB::table('resources_per_projects')->delete();
    DB::table('resources')->delete();
    DB::table('projects')->delete();
    echo('Database cleared successfully');
});
