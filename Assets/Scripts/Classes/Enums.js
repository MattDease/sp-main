#pragma strict

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

public enum PlayerRole {
    Runner,
    Commander,
    Player
};

public enum EnemyType {
    Beetle,
    Worm,
    Wasp,
    Cardinal,
};

public enum SignType {
    Runner,
    Egg,
    Commander
};

public enum GameDifficulty {
    Tutorial,
    Easy,
    Medium,
    Hard,
    Expert
};

// public enum LevelDifficulty {
//     Easy,
//     Medium,
//     Hard
// };
