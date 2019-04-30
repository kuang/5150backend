<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TestAPIs extends TestCase
{

    use DatabaseTransactions;

    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function testExample()
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_displayAllProjects()
    {
//        $response = $this->get('api/displayAllProjects');
//        $response->assertStatus(200);
//        $this->json('GET', 'api/displayAllProjects')
//            -> assertJson([
//                'created' => true
//            ]);


        $this->get('api/displayAllProjects')
            ->seeJsonStructure([
                '*' => [
                    'ProjectID', 'ProjectName', 'Technology', 'EstMaxHours', 'Status', 'StartDate', 'DueDate'
                ]
            ]);

//        $data = json_decode($response->getBody(), true);
//
//        $this->assertArrayHasKey('ProjectID', $data);
    }
}
