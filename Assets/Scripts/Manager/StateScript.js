#pragma strict

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

private var currentMenu : menus = menus.start;
private var currentGameState : GameState = GameState.Uninitialized;

function getCurrentMenu(){
    return currentMenu;
}

function setCurrentMenu(newMenu : menus){
    currentMenu = newMenu;
}

function getGameState(){
    return currentGameState;
}

function setGameState(newGameState : GameState){
    currentGameState = newGameState;
}
