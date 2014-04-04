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
    Valid,
    NoCommander,
    NeedsRunner,
    ManyCommanders,
    NotReady,
    NoCharacter
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
