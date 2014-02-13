#pragma strict

public class Enemy {
    public var start : Transform;
    public var end : Transform;
    public var prefabIndex : int;

    public function Enemy(start : Transform, end : Transform, index : int){
        this.start = start;
        this.end = end;
        this.prefabIndex = index;
    }
}
