
post_install() {
	systemctl daemon-reload
	systemctl enable {{name}}
	systemctl enable {{name}}.socket
	systemctl start {{name}}.socket
	systemctl -q try-reload-or-restart nginx
}

pre_upgrade() {
	systemctl stop {{name}}.socket
	systemctl stop {{name}}
}

post_upgrade() {
	systemctl daemon-reload
	systemctl start {{name}}.socket
	systemctl -q try-reload-or-restart nginx
}

pre_remove() {
	systemctl stop {{name}}.socket
	systemctl disable {{name}}.socket
	systemctl stop {{name}}
	systemctl disable {{name}}
}

post_remove() {
	systemctl daemon-reload
	systemctl -q try-reload-or-restart nginx
}
