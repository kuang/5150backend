<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResourcesPerProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('resources_per_projects');

        Schema::create('resources_per_projects', function (Blueprint $table) {
            $table->bigIncrements("ScheduleID");
            $table->bigInteger("ResourceID")->unsigned();
            $table->bigInteger("ProjectID")->unsigned();

            $table->string("Role");
        });

        DB::unprepared('ALTER TABLE `resources_per_projects` DROP PRIMARY KEY, ADD PRIMARY KEY(`ScheduleID`, `ResourceID`, `ProjectID`)');

        Schema::enableForeignKeyConstraints();

        Schema::table('resources_per_projects', function (Blueprint $table) {
            $table->foreign('ResourceID')->references('ResourceID')->on('resources');
            $table->foreign('ProjectID')->references('ProjectID')->on('projects');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('resources_per_projects');
    }
}
