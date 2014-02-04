#pragma strict

public static class Config{
    /*** Game configuration. ***/

    //// GENERAL
    // General debug mode of the game.
    public var DEBUG : boolean = true;

    //// GAMEPLAY
    // Once all players are ready, the delay in seconds before the game starts.
    public var START_DELAY : float = 3;
    // Distance ahead of the user-controlled runner that the camera is aimed.
    // Defined as a percentage of the viewport.
    public var CAMERA_LEAD : float = 0.25;
    // Maximum position in the viewport that any runner may appear.
    // The camera will move to maintain this position, causing players to
    // die if they go off-screen to the left.
    public var MAX_RUNNER_X : float = 0.90;
    // Running speed in m/s of the runner.
    public var RUN_SPEED : float = 2;
    // Walking speed in m/s of the runner.
    public var WALK_SPEED : float = 1;
    // Upward impulse speed in m/s.
    public var JUMP_SPEED : float = 7;
    // Time in seconds of the runner crouch state.
    public var CROUCH_DURATION : float = 1;

    //// NETWORKING
    // ID that all hosts will use to register their game with the master server.
    public var GAME_ID : String = "scrambled-by-poached_v1.0.0";
    // Port over which the host and clients will communicate during the game.
    public var GAME_PORT : int = 25002;
    // Master server ip to use in-case DNS lookup fails
    // Note DNS lookup is disabled due to Unity Pro requirement on Android.
    public var MASTER_SERVER_IP : String = "172.19.14.114";
    // Master server hostname used for DNS lookup
    public var MASTER_SERVER_HOSTNAME : String = "scrambled.no-ip.biz";
    // Enable if connection test server is available.
    // Tests the type of the device's connection.
    public var TEST_CONNECTION : boolean = false;

}
