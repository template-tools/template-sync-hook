
post_install() {
	systemctl daemon-reload
	systemctl enable {{name}}
	systemctl enable {{name}}.socket
}

pre_upgrade() {
	systemctl stop {{name}}
}

post_upgrade() {
	systemctl daemon-reload
	systemctl start {{name}}
}

pre_remove() {
	systemctl disable {{name}}.socket
	systemctl stop {{name}}
	systemctl disable {{name}}
}
