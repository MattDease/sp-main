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
    Observing,
    Ended
};

public enum GameMode {
    Team,
    Versus
};

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
