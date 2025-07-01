package com.example.gamescore;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    private int score1 = 0;
    private int score2 = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView textViewTeam1Score = findViewById(R.id.textViewTeam1Score);
        TextView textViewTeam2Score = findViewById(R.id.textViewTeam2Score);

        textViewTeam1Score.setText(String.valueOf(score1));
        textViewTeam2Score.setText(String.valueOf(score2));

        textViewTeam1Score.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                textViewTeam1Score.setText(String.valueOf(++score1));
            }
        });

        textViewTeam2Score.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                textViewTeam2Score.setText(String.valueOf(++score2));
            }
        });
    }
}