module.exports = class Data1701273399531 {
    name = 'Data1701273399531'

    async up(db) {
        await db.query(`CREATE TABLE "next_entity_id" ("entity_name" character varying NOT NULL, "next_id" bigint NOT NULL, CONSTRAINT "PK_09a3b40db622a65096e7344d7ae" PRIMARY KEY ("entity_name"))`)
        await db.query(`CREATE TABLE "event" ("id" character varying NOT NULL, "in_block" integer NOT NULL, "in_extrinsic" text, "index_in_block" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_8f3f220c4e717207d841d4e6d4" ON "event" ("in_extrinsic") `)
        await db.query(`CREATE TABLE "membership" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "handle" text NOT NULL, "handle_raw" text NOT NULL, "controller_account" text NOT NULL, "total_channels_created" integer NOT NULL, CONSTRAINT "Membership_handleRaw" UNIQUE ("handle_raw") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "PK_83c1afebef3059472e7c37e8de8" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_0c5b879f9f2ca57a774f74f7f0" ON "membership" ("handle_raw") `)
        await db.query(`CREATE TABLE "storage_bucket" ("id" character varying NOT NULL, "operator_status" jsonb NOT NULL, "accepting_new_bags" boolean NOT NULL, "data_objects_size_limit" numeric NOT NULL, "data_object_count_limit" numeric NOT NULL, "data_objects_count" numeric NOT NULL, "data_objects_size" numeric NOT NULL, CONSTRAINT "PK_97cd0c3fe7f51e34216822e5f91" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "storage_bucket_bag" ("id" character varying NOT NULL, "storage_bucket_id" character varying, "bag_id" character varying, CONSTRAINT "StorageBucketBag_storageBucket_bag" UNIQUE ("storage_bucket_id", "bag_id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "PK_9d54c04557134225652d566cc82" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_aaf00b2c7d0cba49f97da14fbb" ON "storage_bucket_bag" ("bag_id") `)
        await db.query(`CREATE INDEX "IDX_4c475f6c9300284b095859eec3" ON "storage_bucket_bag" ("storage_bucket_id", "bag_id") `)
        await db.query(`CREATE TABLE "distribution_bucket_family" ("id" character varying NOT NULL, CONSTRAINT "PK_8cb7454d1ec34b0d3bb7ecdee4e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "distribution_bucket_operator" ("id" character varying NOT NULL, "distribution_bucket_id" character varying, "worker_id" integer NOT NULL, "status" character varying(7) NOT NULL, CONSTRAINT "PK_03b87e6e972f414bab94c142285" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_678dc5427cdde0cd4fef2c07a4" ON "distribution_bucket_operator" ("distribution_bucket_id") `)
        await db.query(`CREATE TABLE "distribution_bucket" ("id" character varying NOT NULL, "family_id" character varying, "bucket_index" integer NOT NULL, "accepting_new_bags" boolean NOT NULL, "distributing" boolean NOT NULL, CONSTRAINT "PK_c90d25fff461f2f5fa9082e2fb7" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_8cb7454d1ec34b0d3bb7ecdee4" ON "distribution_bucket" ("family_id") `)
        await db.query(`CREATE TABLE "distribution_bucket_bag" ("id" character varying NOT NULL, "distribution_bucket_id" character varying, "bag_id" character varying, CONSTRAINT "DistributionBucketBag_distributionBucket_bag" UNIQUE ("distribution_bucket_id", "bag_id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "PK_02cb97c17ccabf42e8f5154d002" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_a9810100aee7584680f197c8ff" ON "distribution_bucket_bag" ("bag_id") `)
        await db.query(`CREATE INDEX "IDX_32e552d352848d64ab82d38e9a" ON "distribution_bucket_bag" ("distribution_bucket_id", "bag_id") `)
        await db.query(`CREATE TABLE "storage_bag" ("id" character varying NOT NULL, "owner" jsonb NOT NULL, CONSTRAINT "PK_242aecdc788d9b22bcbb9ade19a" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "storage_data_object" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_accepted" boolean NOT NULL, "accepting_bucket_id" numeric, "size" numeric NOT NULL, "storage_bag_id" character varying, "ipfs_hash" text NOT NULL, "type" jsonb, "state_bloat_bond" numeric NOT NULL, "unset_at" TIMESTAMP WITH TIME ZONE, "resolved_urls" text array NOT NULL, CONSTRAINT "PK_61f224a4aef08f580a5ab4aadf0" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_ff8014300b8039dbaed764f51b" ON "storage_data_object" ("storage_bag_id") `)
        await db.query(`CREATE TABLE "app" ("id" character varying NOT NULL, "name" text NOT NULL, "owner_member_id" character varying, "website_url" text, "use_uri" text, "small_icon" text, "medium_icon" text, "big_icon" text, "one_liner" text, "description" text, "terms_of_service" text, "platforms" text array, "category" text, "auth_key" text, CONSTRAINT "App_name" UNIQUE ("name") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_f36adbb7b096ceeb6f3e80ad14" ON "app" ("name") `)
        await db.query(`CREATE INDEX "IDX_c9cc395bbc485f70a15be64553" ON "app" ("owner_member_id") `)
        await db.query(`CREATE TABLE "channel" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "owner_member_id" character varying, "title" text, "description" text, "cover_photo_id" character varying, "avatar_photo_id" character varying, "is_public" boolean, "is_censored" boolean NOT NULL, "is_excluded" boolean NOT NULL, "language" text, "created_in_block" integer NOT NULL, "channel_state_bloat_bond" numeric NOT NULL, "entry_app_id" character varying, "total_videos_created" integer NOT NULL, CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_25c85bc448b5e236a4c1a5f789" ON "channel" ("owner_member_id") `)
        await db.query(`CREATE INDEX "IDX_a77e12f3d8c6ced020e179a5e9" ON "channel" ("cover_photo_id") `)
        await db.query(`CREATE INDEX "IDX_6997e94413b3f2f25a84e4a96f" ON "channel" ("avatar_photo_id") `)
        await db.query(`CREATE INDEX "IDX_e58a2e1d78b8eccf40531a7fdb" ON "channel" ("language") `)
        await db.query(`CREATE INDEX "IDX_118ecfa0199aeb5a014906933e" ON "channel" ("entry_app_id") `)
        await db.query(`CREATE TABLE "license" ("id" character varying NOT NULL, "code" integer, "attribution" text, "custom_text" text, CONSTRAINT "PK_f168ac1ca5ba87286d03b2ef905" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "video_subtitle" ("id" character varying NOT NULL, "video_id" character varying, "type" text NOT NULL, "language" text, "mime_type" text NOT NULL, "asset_id" character varying, CONSTRAINT "PK_2ac3e585fc608e673e7fbf94d8e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_2203674f18d8052ed6bac39625" ON "video_subtitle" ("video_id") `)
        await db.query(`CREATE INDEX "IDX_ffa63c28188eecc32af921bfc3" ON "video_subtitle" ("language") `)
        await db.query(`CREATE INDEX "IDX_b6eabfb8de4128b28d73681020" ON "video_subtitle" ("asset_id") `)
        await db.query(`CREATE TABLE "video" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "channel_id" character varying, "title" text, "description" text, "duration" integer, "thumbnail_photo_id" character varying, "language" text, "published_before_joystream" TIMESTAMP WITH TIME ZONE, "is_public" boolean, "is_censored" boolean NOT NULL, "is_excluded" boolean NOT NULL, "is_explicit" boolean, "license_id" character varying, "media_id" character varying, "video_state_bloat_bond" numeric NOT NULL, "created_in_block" integer NOT NULL, "entry_app_id" character varying, "yt_video_id" text, CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_81b11ef99a9db9ef1aed040d75" ON "video" ("channel_id") `)
        await db.query(`CREATE INDEX "IDX_8530d052cc79b420f7ce2b4e09" ON "video" ("thumbnail_photo_id") `)
        await db.query(`CREATE INDEX "IDX_75fbab42a4cb18371b6d5004b0" ON "video" ("language") `)
        await db.query(`CREATE INDEX "IDX_3ec633ae5d0477f512b4ed957d" ON "video" ("license_id") `)
        await db.query(`CREATE INDEX "IDX_2db879ed42e3308fe65e679672" ON "video" ("media_id") `)
        await db.query(`CREATE INDEX "IDX_6c49ad08c44d36d11f77c426e4" ON "video" ("entry_app_id") `)
        await db.query(`CREATE TABLE "video_media_encoding" ("id" character varying NOT NULL, "codec_name" text, "container" text, "mime_media_type" text, CONSTRAINT "PK_52e25874f8d8a381e154d1125e0" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "video_media_metadata" ("id" character varying NOT NULL, "encoding_id" character varying, "pixel_width" integer, "pixel_height" integer, "size" numeric, "video_id" character varying NOT NULL, "created_in_block" integer NOT NULL, CONSTRAINT "VideoMediaMetadata_video" UNIQUE ("video_id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "REL_4dc101240e8e1536b770aee202" UNIQUE ("video_id"), CONSTRAINT "PK_86a13815734e589cd86d0465e2d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_5944dc5896cb16bd395414a0ce" ON "video_media_metadata" ("encoding_id") `)
        await db.query(`CREATE INDEX "IDX_4dc101240e8e1536b770aee202" ON "video_media_metadata" ("video_id") `)
        await db.query(`CREATE TABLE "storage_bucket_operator_metadata" ("id" character varying NOT NULL, "storage_bucket_id" character varying NOT NULL, "node_endpoint" text, "node_location" jsonb, "extra" text, CONSTRAINT "StorageBucketOperatorMetadata_storageBucket" UNIQUE ("storage_bucket_id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "REL_7beffc9530b3f307bc1169cb52" UNIQUE ("storage_bucket_id"), CONSTRAINT "PK_9846a397400ae1a39b21fbd02d4" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_7beffc9530b3f307bc1169cb52" ON "storage_bucket_operator_metadata" ("storage_bucket_id") `)
        await db.query(`CREATE TABLE "distribution_bucket_family_metadata" ("id" character varying NOT NULL, "family_id" character varying NOT NULL, "region" text, "description" text, "areas" jsonb, "latency_test_targets" text array, CONSTRAINT "DistributionBucketFamilyMetadata_family" UNIQUE ("family_id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "REL_dd93ca0ea24f3e7a02f11c4c14" UNIQUE ("family_id"), CONSTRAINT "PK_df7a270835bb313d3ef17bdee2f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_dd93ca0ea24f3e7a02f11c4c14" ON "distribution_bucket_family_metadata" ("family_id") `)
        await db.query(`CREATE INDEX "IDX_5510d3b244a63d6ec702faa426" ON "distribution_bucket_family_metadata" ("region") `)
        await db.query(`CREATE TABLE "distribution_bucket_operator_metadata" ("id" character varying NOT NULL, "distirbution_bucket_operator_id" character varying NOT NULL, "node_endpoint" text, "node_location" jsonb, "extra" text, CONSTRAINT "DistributionBucketOperatorMetadata_distirbutionBucketOperator" UNIQUE ("distirbution_bucket_operator_id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "REL_69ec9bdc975b95f7dff94a7106" UNIQUE ("distirbution_bucket_operator_id"), CONSTRAINT "PK_9bbecaa12f30e3826922688274f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_69ec9bdc975b95f7dff94a7106" ON "distribution_bucket_operator_metadata" ("distirbution_bucket_operator_id") `)
        await db.query(`CREATE TABLE "member_metadata" ("id" character varying NOT NULL, "name" text, "avatar" jsonb, "about" text, "member_id" character varying NOT NULL, CONSTRAINT "MemberMetadata_member" UNIQUE ("member_id") DEFERRABLE INITIALLY DEFERRED, CONSTRAINT "REL_e7e4d350f82ae2383894f465ed" UNIQUE ("member_id"), CONSTRAINT "PK_d3fcc374696465f3c0ac3ba8708" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_e7e4d350f82ae2383894f465ed" ON "member_metadata" ("member_id") `)
        await db.query(`ALTER TABLE "storage_bucket_bag" ADD CONSTRAINT "FK_791e2f82e3919ffcef8712aa1b9" FOREIGN KEY ("storage_bucket_id") REFERENCES "storage_bucket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "storage_bucket_bag" ADD CONSTRAINT "FK_aaf00b2c7d0cba49f97da14fbba" FOREIGN KEY ("bag_id") REFERENCES "storage_bag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "distribution_bucket_operator" ADD CONSTRAINT "FK_678dc5427cdde0cd4fef2c07a43" FOREIGN KEY ("distribution_bucket_id") REFERENCES "distribution_bucket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "distribution_bucket" ADD CONSTRAINT "FK_8cb7454d1ec34b0d3bb7ecdee4e" FOREIGN KEY ("family_id") REFERENCES "distribution_bucket_family"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "distribution_bucket_bag" ADD CONSTRAINT "FK_8a807921f1aae60d4ba94895826" FOREIGN KEY ("distribution_bucket_id") REFERENCES "distribution_bucket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "distribution_bucket_bag" ADD CONSTRAINT "FK_a9810100aee7584680f197c8ff0" FOREIGN KEY ("bag_id") REFERENCES "storage_bag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "storage_data_object" ADD CONSTRAINT "FK_ff8014300b8039dbaed764f51bc" FOREIGN KEY ("storage_bag_id") REFERENCES "storage_bag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "app" ADD CONSTRAINT "FK_c9cc395bbc485f70a15be64553e" FOREIGN KEY ("owner_member_id") REFERENCES "membership"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_25c85bc448b5e236a4c1a5f7895" FOREIGN KEY ("owner_member_id") REFERENCES "membership"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_a77e12f3d8c6ced020e179a5e94" FOREIGN KEY ("cover_photo_id") REFERENCES "storage_data_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_6997e94413b3f2f25a84e4a96f8" FOREIGN KEY ("avatar_photo_id") REFERENCES "storage_data_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_118ecfa0199aeb5a014906933e8" FOREIGN KEY ("entry_app_id") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video_subtitle" ADD CONSTRAINT "FK_2203674f18d8052ed6bac396252" FOREIGN KEY ("video_id") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video_subtitle" ADD CONSTRAINT "FK_b6eabfb8de4128b28d73681020f" FOREIGN KEY ("asset_id") REFERENCES "storage_data_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_81b11ef99a9db9ef1aed040d750" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_8530d052cc79b420f7ce2b4e09d" FOREIGN KEY ("thumbnail_photo_id") REFERENCES "storage_data_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_3ec633ae5d0477f512b4ed957d6" FOREIGN KEY ("license_id") REFERENCES "license"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_2db879ed42e3308fe65e6796729" FOREIGN KEY ("media_id") REFERENCES "storage_data_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_6c49ad08c44d36d11f77c426e43" FOREIGN KEY ("entry_app_id") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video_media_metadata" ADD CONSTRAINT "FK_5944dc5896cb16bd395414a0ce0" FOREIGN KEY ("encoding_id") REFERENCES "video_media_encoding"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "video_media_metadata" ADD CONSTRAINT "FK_4dc101240e8e1536b770aee202a" FOREIGN KEY ("video_id") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "storage_bucket_operator_metadata" ADD CONSTRAINT "FK_7beffc9530b3f307bc1169cb524" FOREIGN KEY ("storage_bucket_id") REFERENCES "storage_bucket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "distribution_bucket_family_metadata" ADD CONSTRAINT "FK_dd93ca0ea24f3e7a02f11c4c149" FOREIGN KEY ("family_id") REFERENCES "distribution_bucket_family"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "distribution_bucket_operator_metadata" ADD CONSTRAINT "FK_69ec9bdc975b95f7dff94a71069" FOREIGN KEY ("distirbution_bucket_operator_id") REFERENCES "distribution_bucket_operator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
        await db.query(`ALTER TABLE "member_metadata" ADD CONSTRAINT "FK_e7e4d350f82ae2383894f465ede" FOREIGN KEY ("member_id") REFERENCES "membership"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`)
    }

    async down(db) {
        await db.query(`DROP TABLE "next_entity_id"`)
        await db.query(`DROP TABLE "event"`)
        await db.query(`DROP INDEX "public"."IDX_8f3f220c4e717207d841d4e6d4"`)
        await db.query(`DROP TABLE "membership"`)
        await db.query(`DROP INDEX "public"."IDX_0c5b879f9f2ca57a774f74f7f0"`)
        await db.query(`DROP TABLE "storage_bucket"`)
        await db.query(`DROP TABLE "storage_bucket_bag"`)
        await db.query(`DROP INDEX "public"."IDX_aaf00b2c7d0cba49f97da14fbb"`)
        await db.query(`DROP INDEX "public"."IDX_4c475f6c9300284b095859eec3"`)
        await db.query(`DROP TABLE "distribution_bucket_family"`)
        await db.query(`DROP TABLE "distribution_bucket_operator"`)
        await db.query(`DROP INDEX "public"."IDX_678dc5427cdde0cd4fef2c07a4"`)
        await db.query(`DROP TABLE "distribution_bucket"`)
        await db.query(`DROP INDEX "public"."IDX_8cb7454d1ec34b0d3bb7ecdee4"`)
        await db.query(`DROP TABLE "distribution_bucket_bag"`)
        await db.query(`DROP INDEX "public"."IDX_a9810100aee7584680f197c8ff"`)
        await db.query(`DROP INDEX "public"."IDX_32e552d352848d64ab82d38e9a"`)
        await db.query(`DROP TABLE "storage_bag"`)
        await db.query(`DROP TABLE "storage_data_object"`)
        await db.query(`DROP INDEX "public"."IDX_ff8014300b8039dbaed764f51b"`)
        await db.query(`DROP TABLE "app"`)
        await db.query(`DROP INDEX "public"."IDX_f36adbb7b096ceeb6f3e80ad14"`)
        await db.query(`DROP INDEX "public"."IDX_c9cc395bbc485f70a15be64553"`)
        await db.query(`DROP TABLE "channel"`)
        await db.query(`DROP INDEX "public"."IDX_25c85bc448b5e236a4c1a5f789"`)
        await db.query(`DROP INDEX "public"."IDX_a77e12f3d8c6ced020e179a5e9"`)
        await db.query(`DROP INDEX "public"."IDX_6997e94413b3f2f25a84e4a96f"`)
        await db.query(`DROP INDEX "public"."IDX_e58a2e1d78b8eccf40531a7fdb"`)
        await db.query(`DROP INDEX "public"."IDX_118ecfa0199aeb5a014906933e"`)
        await db.query(`DROP TABLE "license"`)
        await db.query(`DROP TABLE "video_subtitle"`)
        await db.query(`DROP INDEX "public"."IDX_2203674f18d8052ed6bac39625"`)
        await db.query(`DROP INDEX "public"."IDX_ffa63c28188eecc32af921bfc3"`)
        await db.query(`DROP INDEX "public"."IDX_b6eabfb8de4128b28d73681020"`)
        await db.query(`DROP TABLE "video"`)
        await db.query(`DROP INDEX "public"."IDX_81b11ef99a9db9ef1aed040d75"`)
        await db.query(`DROP INDEX "public"."IDX_8530d052cc79b420f7ce2b4e09"`)
        await db.query(`DROP INDEX "public"."IDX_75fbab42a4cb18371b6d5004b0"`)
        await db.query(`DROP INDEX "public"."IDX_3ec633ae5d0477f512b4ed957d"`)
        await db.query(`DROP INDEX "public"."IDX_2db879ed42e3308fe65e679672"`)
        await db.query(`DROP INDEX "public"."IDX_6c49ad08c44d36d11f77c426e4"`)
        await db.query(`DROP TABLE "video_media_encoding"`)
        await db.query(`DROP TABLE "video_media_metadata"`)
        await db.query(`DROP INDEX "public"."IDX_5944dc5896cb16bd395414a0ce"`)
        await db.query(`DROP INDEX "public"."IDX_4dc101240e8e1536b770aee202"`)
        await db.query(`DROP TABLE "storage_bucket_operator_metadata"`)
        await db.query(`DROP INDEX "public"."IDX_7beffc9530b3f307bc1169cb52"`)
        await db.query(`DROP TABLE "distribution_bucket_family_metadata"`)
        await db.query(`DROP INDEX "public"."IDX_dd93ca0ea24f3e7a02f11c4c14"`)
        await db.query(`DROP INDEX "public"."IDX_5510d3b244a63d6ec702faa426"`)
        await db.query(`DROP TABLE "distribution_bucket_operator_metadata"`)
        await db.query(`DROP INDEX "public"."IDX_69ec9bdc975b95f7dff94a7106"`)
        await db.query(`DROP TABLE "member_metadata"`)
        await db.query(`DROP INDEX "public"."IDX_e7e4d350f82ae2383894f465ed"`)
        await db.query(`ALTER TABLE "storage_bucket_bag" DROP CONSTRAINT "FK_791e2f82e3919ffcef8712aa1b9"`)
        await db.query(`ALTER TABLE "storage_bucket_bag" DROP CONSTRAINT "FK_aaf00b2c7d0cba49f97da14fbba"`)
        await db.query(`ALTER TABLE "distribution_bucket_operator" DROP CONSTRAINT "FK_678dc5427cdde0cd4fef2c07a43"`)
        await db.query(`ALTER TABLE "distribution_bucket" DROP CONSTRAINT "FK_8cb7454d1ec34b0d3bb7ecdee4e"`)
        await db.query(`ALTER TABLE "distribution_bucket_bag" DROP CONSTRAINT "FK_8a807921f1aae60d4ba94895826"`)
        await db.query(`ALTER TABLE "distribution_bucket_bag" DROP CONSTRAINT "FK_a9810100aee7584680f197c8ff0"`)
        await db.query(`ALTER TABLE "storage_data_object" DROP CONSTRAINT "FK_ff8014300b8039dbaed764f51bc"`)
        await db.query(`ALTER TABLE "app" DROP CONSTRAINT "FK_c9cc395bbc485f70a15be64553e"`)
        await db.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_25c85bc448b5e236a4c1a5f7895"`)
        await db.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_a77e12f3d8c6ced020e179a5e94"`)
        await db.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_6997e94413b3f2f25a84e4a96f8"`)
        await db.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_118ecfa0199aeb5a014906933e8"`)
        await db.query(`ALTER TABLE "video_subtitle" DROP CONSTRAINT "FK_2203674f18d8052ed6bac396252"`)
        await db.query(`ALTER TABLE "video_subtitle" DROP CONSTRAINT "FK_b6eabfb8de4128b28d73681020f"`)
        await db.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_81b11ef99a9db9ef1aed040d750"`)
        await db.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_8530d052cc79b420f7ce2b4e09d"`)
        await db.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_3ec633ae5d0477f512b4ed957d6"`)
        await db.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_2db879ed42e3308fe65e6796729"`)
        await db.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_6c49ad08c44d36d11f77c426e43"`)
        await db.query(`ALTER TABLE "video_media_metadata" DROP CONSTRAINT "FK_5944dc5896cb16bd395414a0ce0"`)
        await db.query(`ALTER TABLE "video_media_metadata" DROP CONSTRAINT "FK_4dc101240e8e1536b770aee202a"`)
        await db.query(`ALTER TABLE "storage_bucket_operator_metadata" DROP CONSTRAINT "FK_7beffc9530b3f307bc1169cb524"`)
        await db.query(`ALTER TABLE "distribution_bucket_family_metadata" DROP CONSTRAINT "FK_dd93ca0ea24f3e7a02f11c4c149"`)
        await db.query(`ALTER TABLE "distribution_bucket_operator_metadata" DROP CONSTRAINT "FK_69ec9bdc975b95f7dff94a71069"`)
        await db.query(`ALTER TABLE "member_metadata" DROP CONSTRAINT "FK_e7e4d350f82ae2383894f465ede"`)
    }
}
