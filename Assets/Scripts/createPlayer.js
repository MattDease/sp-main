#pragma strict

function Start () {

}

function Update () {

}


function OnGUI () {
    // Make a background box
    GUI.Box (Rect (10,10,100,40), "Loader Menu");

    // Make the first button. If it is pressed, Application.Loadlevel (1) will be executed
    if (GUI.Button (Rect (20,40,80,20), "Example")) {
        loadCharacter("Player One", "Twilight/twilight");
    }
}

function loadCharacter(type, url) {

    //Load a Character from the resource folder, set up its player controls

    var instance : GameObject = Instantiate(Resources.Load(url), Vector3(Random.Range(0,100), 0, 0), Quaternion.identity);
    instance.name = type;
    instance.AddComponent(BoxCollider);
    instance.AddComponent(Rigidbody);

    var instanceTransform = instance.GetComponent(Transform);

    var controlsGameObject = new GameObject(type + "_Controls");
    controlsGameObject.AddComponent('playerGesture');
    var instanceControls  =  controlsGameObject.GetComponent(playerGesture);
    instanceControls.projectileObject = instanceTransform;

}
