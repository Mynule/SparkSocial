up:
	docker compose up -d
down:
	docker compose down
php:
	docker compose exec --user php php bash
mysql:
	docker compose exec mysql bash
ps:
	docker compose ps
dev:
	docker compose run --rm node run dev
npm:
	docker compose run --rm --entrypoint bash node
fixperm:
	sudo chown -R timur:timur app config database resources routes tests composer.json package.json
	sudo chown -R timur:www-data bootstrap storage/app storage/framework storage/logs
	sudo chmod -R g+w bootstrap storage/app storage/framework storage/logs
dump:
	@docker compose exec -u www-data php php artisan dump

pint:
	@docker compose exec -u www-data php ./vendor/bin/pint .
