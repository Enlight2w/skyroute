CREATE TABLE `notification_delivery_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`channel` enum('email','sms') NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`recipientMasked` varchar(320) NOT NULL,
	`subject` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`status` enum('simulated','queued','failed') NOT NULL DEFAULT 'simulated',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_delivery_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`priceDropEnabled` boolean NOT NULL DEFAULT true,
	`flightStatusEnabled` boolean NOT NULL DEFAULT true,
	`checkInEnabled` boolean NOT NULL DEFAULT true,
	`gateEnabled` boolean NOT NULL DEFAULT true,
	`calendarEnabled` boolean NOT NULL DEFAULT true,
	`inAppEnabled` boolean NOT NULL DEFAULT true,
	`emailEnabled` boolean NOT NULL DEFAULT true,
	`smsEnabled` boolean NOT NULL DEFAULT false,
	`whatsappEnabled` boolean NOT NULL DEFAULT false,
	`timing` varchar(64) NOT NULL DEFAULT 'Instant',
	`priceTarget` int NOT NULL DEFAULT 450,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `notification_delivery_logs_user_idx` ON `notification_delivery_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `notification_preferences_user_idx` ON `notification_preferences` (`userId`);