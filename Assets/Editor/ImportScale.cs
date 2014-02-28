// source : http://answers.unity3d.com/questions/12187/import-settings.html

using UnityEditor;

public class FBXScaleFix : AssetPostprocessor
{
    public void OnPreprocessModel()
    {
        ModelImporter modelImporter = (ModelImporter) assetImporter;
        modelImporter.globalScale = 1;
    }
}
