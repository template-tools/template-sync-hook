post_install() {
	systemctl daemon-reload
	systemctl enable template-sync-hook
	systemctl enable template-sync-hook.socket
	systemctl start template-sync-hook.socket
}

pre_upgrade() {
	systemctl stop template-sync-hook.socket
	systemctl stop template-sync-hook
}

post_upgrade() {
	systemctl daemon-reload
	systemctl start template-sync-hook.socket
}

pre_remove() {
	systemctl stop template-sync-hook.socket
	systemctl disable template-sync-hook.socket
	systemctl stop template-sync-hook
	systemctl disable template-sync-hook
}
