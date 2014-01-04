#pragma strict

function Update(){
    var hit : RaycastHit;

    var fwd = transform.TransformDirection (Vector3.forward);

    if(Physics.Linecast(gameObject.transform.position, fwd, hit, 1)) {
        // Debug.Log(hit.collider.gameObject.name);
    }
    Debug.DrawRay(gameObject.transform.position, fwd, Color.red, 1.0);

}
