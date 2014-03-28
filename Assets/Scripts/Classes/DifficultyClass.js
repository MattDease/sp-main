#pragma strict

public class Difficulty {

    public var current : GameDifficulty;
    public var previous : GameDifficulty;
    public var next : GameDifficulty;

    public function Difficulty(current : GameDifficulty, previous : GameDifficulty, next : GameDifficulty){
        this.current = current;
        this.previous = previous;
        this.next = next;
    }
}
