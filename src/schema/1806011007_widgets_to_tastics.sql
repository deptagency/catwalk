DROP TABLE widget;
CREATE TABLE tastic (w_id VARCHAR(255) NOT NULL, w_sequence VARCHAR(255) NOT NULL, w_tastic_type VARCHAR(255) NOT NULL, w_name VARCHAR(255) DEFAULT NULL, w_description LONGTEXT DEFAULT NULL, w_configuratiow_schema LONGTEXT NOT NULL COMMENT '(DC2Type:object)', w_environment VARCHAR(255) DEFAULT NULL, w_meta_data LONGTEXT NOT NULL COMMENT '(DC2Type:object)', w_is_deleted TINYINT(1) NOT NULL, INDEX IDX_CFD59F7B4EAC5B1B (w_id), INDEX IDX_CFD59F7B6D507072 (w_sequence), PRIMARY KEY(w_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB;
