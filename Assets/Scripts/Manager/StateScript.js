#pragma strict

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
