import streamlit as st
import streamlit.components.v1 as components
from pathlib import Path


st.set_page_config(
    page_title="Dino Run",
    page_icon="🦖",
    layout="centered"
)


BASE_DIR = Path(__file__).parent


def load_game():
    html = (BASE_DIR / "index.html").read_text(
        encoding="utf-8"
    )

    css = (BASE_DIR / "style.css").read_text(
        encoding="utf-8"
    )

    js = (BASE_DIR / "game.js").read_text(
        encoding="utf-8"
    )

    # 외부 CSS 연결 제거
    html = html.replace(
        '<link rel="stylesheet" href="style.css">',
        f"<style>{css}</style>"
    )

    # 외부 JS 연결 제거
    html = html.replace(
        '<script src="game.js"></script>',
        f"<script>{js}</script>"
    )

    return html


st.markdown(
    """
    <style>
        .block-container {
            padding-top: 2rem;
            padding-bottom: 1rem;
            max-width: 1000px;
        }

        header {
            visibility: hidden;
        }

        footer {
            visibility: hidden;
        }
    </style>
    """,
    unsafe_allow_html=True
)


game_html = load_game()

components.html(
    game_html,
    height=430,
    scrolling=False
)
