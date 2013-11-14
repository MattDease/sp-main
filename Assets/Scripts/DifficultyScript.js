#pragma strict

/* Variables that determines at what level segment we change difficulty.
Tutorial runs before the easy amount - to change the length */
private var EASY_AMOUNT : int = 5;
private var MEDIUM_AMOUNT : int = 20;
private var HARD_AMOUNT : int = 30;
private var EXPERT_AMOUNT : int = 40;

public enum difficulty {
    tutorial,
    easy,
    medium,
    hard,
    expert
}

private var currentDifficulty : difficulty = difficulty.tutorial;

public var segmentCount : int = 1 ;

function getCurrentDifficulty(){
    return currentDifficulty;
}

function setCurrentDifficulty(newDiff : difficulty){
    currentDifficulty = newDiff;
}

function getSegmentCount() {
    return segmentCount;
}

function setSegmentCount(newCount : int) {
    segmentCount = newCount;
}

function Update() {
    switch(segmentCount) {
        case EASY_AMOUNT:
            currentDifficulty = difficulty.easy;
        break;
        case MEDIUM_AMOUNT:
            currentDifficulty = difficulty.medium;
        break;
        case HARD_AMOUNT:
            currentDifficulty = difficulty.hard;
        break;
        case EXPERT_AMOUNT:
            currentDifficulty = difficulty.expert;
        break;
    }


}
