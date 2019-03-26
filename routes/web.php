<?php
use Illuminate\Support\Facades\DB;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/** Displays initial webpage */
Route::get('/', function () {
    return view('welcome');
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

/** Route that adds a new project to the projects table
 * ProjectID: auto-incrementing key, so value that is inputted for it does not matter */
Route::get('/addProject', function() {
    DB::table('projects')->insertGetId(
        ["ProjectID" => 0, "ProjectName" => "Test", "Technology" => "Laravel", "EstMaxHours" => 40,
            "Status" => "Done", "StartDate" => date_create("2019-3-24"), "DueDate" => date_create("2019-3-24")]
    );
});

/** Route that adds a new resource to the resources table
 * ResourceID: auto-incrementing key, so value that is inputted for it does not matter */
Route::get('/addResource', function() {
    DB::table('resources')->insertGetId(
        ["ResourceID" => 0, "FirstName" => "Jonathan", "LastName" => "Ou", "MaxHoursPerWeek" => 40]);
});

/** Route that adds a new entry to the resources_per_projects table
 * ResourceID, ProjectID, ScheduleID: auto-incrementing key, so value that is inputted for it does not matter */
Route::get('/addResourcePerProject', function() {
    DB::table('resources_per_projects')->insertGetId(
        ["ResourceID" => 1, "ProjectID" => 1, "Role" => "APM", "ScheduleID" => 0]);
});

/** Route that adds a new entry to the schedules table
 * ScheduleID: auto-incrementing key, so value that is inputted for it does not matter */
Route::get('/addSchedule', function() {
    DB::table('schedules')->insertGetId(
        ["ScheduleID" => 1, "Dates" => date_create("2019-3-24"), "HoursPerWeek" => 30]);
});


