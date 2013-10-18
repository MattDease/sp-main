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

private var currentMenu : menus = menus.start;

function getCurrentMenu(){
    return currentMenu;
}

function setCurrentMenu(newMenu : menus){
    currentMenu = newMenu;
}
