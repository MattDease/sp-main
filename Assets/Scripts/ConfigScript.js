#pragma strict

public static class Config{
    /*** Game configuration. ***/

    //// GENERAL
    // General debug mode of the game.
    public var DEBUG : boolean = false;
    // General debug mode of the game.
    public var MENU_DEBUG : boolean = false;
    // Enable/Disable the egg in the game.
    public var USE_EGG : boolean = false;
    //Enable/Disable the tutorial signs in the game
    public var USE_SIGNS : boolean = true;

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
    public var RUN_SPEED : float = 2.7;
    // Walking speed in m/s of the runner.
    public var WALK_SPEED : float = 1.4;
    // Upward impulse speed in m/s.
    public var JUMP_SPEED : float = 4;
    // Time in seconds of the runner crouch state.
    public var CROUCH_DURATION : float = 1;

    public var MAX_TEAM_COUNT : int = 5;
    // Time in seconds of the runner attack state.
    public var ATTACK_DURATION : float = 1;
    // Wasp and beetle enemy speed in m/s.
    public var WASP_BEETLE_SPEED : float = 0.3;
    // Cardinal enemy speed in m/s.
    public var CARDINAL_SPEED : float = 1.5;
    // Time in seconds between worm attacks.
    public var WORM_DELAY : float = 1.5;
    // Offset between different worm attack times
    public var WORM_DELAY_OFFSET : float = 0.5;
    // Distance in x-axis between runner and cardinal's end point that will
    // trigger the cardinal to attack
    public var CARDINAL_TRIGGER_DISTANCE : float = 4;
    // Relative to the level segment, the commander's offset in the z-axis, + is away from the camera
    public var COMMANDER_DEPTH_OFFSET : float = -0.6;
    // Relative to the world origin, the opposing team's offset in the z-axis, + is away from the camera
    public var TEAM_DEPTH_OFFSET : float = 6;
    // Spacing in the z-axis between runners on the same team
    public var RUNNER_LANE_WIDTH : float = 0.6;
    // Duration in seconds of transition between running and walking speeds;
    public var SPEED_TRANSITION_DURATION : float = 0.3;

    //// NETWORKING
    // ID that all hosts will use to register their game with the master server.
    public var GAME_ID : String = "scrambled-by-poached_v1.0.0";
    // Port over which the host and clients will communicate during the game.
    public var GAME_PORT : int = 25002;
    // Master server ip to use in-case DNS lookup fails
    // Note DNS lookup is disabled due to Unity Pro requirement on Android.
    public var MASTER_SERVER_IP : String = "192.168.11.11";
    // Backup master server IP
    public var MASTER_SERVER_IP_SECONDARY : String = "172.19.12.112";
    // Master server hostname used for DNS lookup
    public var MASTER_SERVER_HOSTNAME : String = "scrambled.no-ip.biz";
    // Enable if connection test server is available.
    // Tests the type of the device's connection.
    public var TEST_CONNECTION : boolean = false;

    //Sets team size limit
    public var TEAM_SIZE : int = 11;
    //Sets versus to automatically change when teamsize is greater than 5
    public var VERSUS_ENABLED : boolean = false;
    //Skips validation of team
    public var VALIDATION_SKIP : boolean = false;
    //Distance between Player and Tutorial Sign required to show sign
    public var TUTORIAL_SIGN_DISTANCE : int = 10;
    //How many times you see a tutorial sign
    public var MAX_SIGN_COUNT : int = 3;
}
