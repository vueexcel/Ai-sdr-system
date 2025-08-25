-- CreateTable
CREATE TABLE "public"."Prospect" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "linkedin_url" TEXT,
    "company" TEXT,
    "job_title" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "qualification_score" INTEGER NOT NULL DEFAULT 0,
    "campaign_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "target_criteria" JSONB NOT NULL,
    "message_templates" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "daily_limits" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" SERIAL NOT NULL,
    "prospect_id" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "last_message_at" TIMESTAMP(3),
    "next_action" TEXT,
    "context" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "message_text" TEXT NOT NULL,
    "is_sent_by_ai" BOOLEAN NOT NULL,
    "message_type" TEXT NOT NULL,
    "platform_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prospect_status_industry_idx" ON "public"."Prospect"("status", "industry");

-- CreateIndex
CREATE INDEX "Conversation_prospect_id_platform_idx" ON "public"."Conversation"("prospect_id", "platform");

-- CreateIndex
CREATE INDEX "Message_conversation_id_created_at_idx" ON "public"."Message"("conversation_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."Prospect" ADD CONSTRAINT "Prospect_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
