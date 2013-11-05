#pragma strict

var speed = 150;

 var levelSegment : GameObject[];

function Update () {
    transform.Translate(Vector3(Input.GetAxis("Horizontal") * speed * Time.deltaTime, Input.GetAxis("Vertical") * speed * Time.deltaTime, 0.0));

    levelSegment = GameObject.FindGameObjectsWithTag("levelSegment");

}
