#pragma strict

public static class Config{
    /*** Game configuration. ***/

    //// GENERAL
    // General debug mode of the game.
    public var DEBUG : boolean = true;

    //// GAMEPLAY
    public var START_DELAY : float = 3;
    public var CAMERA_LEAD : float = 0.25;
    public var MAX_RUNNER_X : float = 0.90;
    public var RUN_SPEED : float = 2;
    public var WALK_SPEED : float = 1;
    public var JUMP_SPEED : float = 7;
    public var CROUCH_DURATION : float = 1;

    //// NETWORKING
    // Enable if connection test server is available.
    // Tests the type of the device's connection.
    public var TEST_CONNECTION : boolean = false;

}
