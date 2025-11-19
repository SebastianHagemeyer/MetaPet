package com.metapet.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.meta.spatial.core.Entity
import com.meta.spatial.core.Pose
import com.meta.spatial.core.Quaternion
import com.meta.spatial.core.SpatialFeature
import com.meta.spatial.core.Vector3
import com.meta.spatial.runtime.SceneLoadedEvent
import com.meta.spatial.toolkit.AppSystemActivity
import com.meta.spatial.toolkit.Mesh
import com.meta.spatial.toolkit.Material
import com.meta.spatial.toolkit.Transform

class MainActivity : AppSystemActivity() {

    override fun registerFeatures(): List<SpatialFeature> {
        return listOf()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set up Compose UI for 2D panel
        setContent {
            MetaPetTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }

        // Listen for scene loaded event
        scene.registerListener(
            SceneLoadedEvent::class.java,
            { event -> onSceneLoaded() }
        )
    }

    private fun onSceneLoaded() {
        // Create a simple 3D object in the scene
        createWelcomeObject()
    }

    private fun createWelcomeObject() {
        // Create a cube entity
        val cubeEntity = Entity.create()

        // Add mesh component (cube)
        cubeEntity.setComponent(
            Mesh(
                mesh = Mesh.CUBE_MESH
            )
        )

        // Add material component
        cubeEntity.setComponent(
            Material().apply {
                baseColor = Vector3(0.2f, 0.6f, 1.0f) // Blue color
            }
        )

        // Position the cube in front of the user
        cubeEntity.setComponent(
            Transform(
                transform = Pose(
                    translation = Vector3(0f, 1.5f, -2f), // 2 meters in front, 1.5m high
                    rotation = Quaternion(0f, 0f, 0f, 1f),
                    scale = Vector3(0.3f, 0.3f, 0.3f)
                )
            )
        )
    }
}

@Composable
fun MainScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "MetaPet",
            style = MaterialTheme.typography.headlineLarge
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Meta Spatial SDK App",
            style = MaterialTheme.typography.bodyLarge
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(onClick = { /* Add interaction */ }) {
            Text("Start Experience")
        }
    }
}

@Composable
fun MetaPetTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = MaterialTheme.colorScheme.primary,
            secondary = MaterialTheme.colorScheme.secondary
        ),
        content = content
    )
}
