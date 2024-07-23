-- CreateTable
CREATE TABLE "Signer" (
    "uuid" TEXT NOT NULL,
    "postingAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fid" TEXT NOT NULL,
    "loginAddresses" TEXT[],

    CONSTRAINT "Signer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Cast" (
    "castHash" TEXT NOT NULL,
    "castText" TEXT NOT NULL,
    "imageUrl" TEXT,
    "scheduleDateTime" TIMESTAMP(3) NOT NULL,
    "signerUuid" TEXT NOT NULL,

    CONSTRAINT "Cast_pkey" PRIMARY KEY ("castHash")
);

-- CreateIndex
CREATE UNIQUE INDEX "Signer_postingAddress_key" ON "Signer"("postingAddress");

-- AddForeignKey
ALTER TABLE "Cast" ADD CONSTRAINT "Cast_signerUuid_fkey" FOREIGN KEY ("signerUuid") REFERENCES "Signer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
