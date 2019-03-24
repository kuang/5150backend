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

/** Displays initial web page */
Route::get('/', function () {
    return view('welcome');
});

/** Route that returns all of the rows in the projects schema */
Route::get('/displayAllProjects', function () {
    return DB::table("projects")->get();
});

/** Route that returns all of the rows in the resources schema */
Route::get('/displayAllResources', function() {
    return DB::table("resources")->get();
});

/** Route that adds a new project row to the projects schema
 * ProjectID: auto-incrementing key, so value that is inputted for it does not matter
 */
Route::get('/addProject', function() {
    DB::table('projects')->insertGetId(
        ["ProjectID" => 0, "ProjectName" => "Test", "Technology" => "Laravel", "EstMaxHours" => 40,
            "Status" => "Done", "StartDate" => date_create("2019-3-24"), "DueDate" => date_create("2019-3-24")]
    );
});

/** Route that adds a new resource to the resources schema
 * ResourceID: auto-incrementing key, so value that is inputted for it does not matter
 */
Route::get('/addResource', function() {
    DB::table('resources')->insertGetId(
        ["ResourceID" => 0, "FirstName" => "Jonathan", "LastName" => "Ou", "MaxHoursPerWeek" => 40]);
});

Route::get('/addResourcePerProject', function() {
    DB::table('resources_per_projects',
        ["ResourceID" => 1, "ProjectID" => 1, "Role" => "APM", "ScheduleID" => 0]);
});

Route::get('/displayResourcesPerProject', function() {
    return DB::table('resources_per_projects')->get();
});