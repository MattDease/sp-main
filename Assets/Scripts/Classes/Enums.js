﻿#pragma strict

// All Public Enums

public enum menus {
    start,
    main,
    lobby,
    quickplay,
    game,
    host,
    highscore
};

public enum GameState {
    Uninitialized,
    Loading,
    Playing,
    Ended,
    Error
};

public enum GameMode {
    Team,
    Versus
};

// Team validity status
public enum TeamStatus {
    // Team is valid
    Valid,
    // Team is not valid
    // TODO - add values for the various ways a team could be invalid
    TEMP_NO
}

public enum PlayerRole{
    Runner,
    Commander
};

// TODO enable/rethink when level generation is refactored
// public enum GameDifficulty {
//     Tutorial,
//     Easy,
//     Medium,
//     Hard,
//     Expert
// };

// public enum LevelDifficulty {
//     Easy,
//     Medium,
//     Hard
// };