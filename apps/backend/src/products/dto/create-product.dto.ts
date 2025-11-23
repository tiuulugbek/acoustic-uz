import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsEnum, Min, IsPositive } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Mahsulot nomi (o\'zbekcha)' })
  @IsString()
  name_uz: string;

  @ApiProperty({ description: 'Mahsulot nomi (ruscha)' })
  @IsString()
  name_ru: string;

  @ApiProperty({ description: 'Mahsulot slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Mahsulot turi' })
  @IsOptional()
  @IsEnum(['hearing-aids', 'accessories', 'interacoustics'])
  productType?: 'hearing-aids' | 'accessories' | 'interacoustics';

  @ApiPropertyOptional({ description: 'Tavsif (o\'zbekcha)' })
  @IsOptional()
  @IsString()
  description_uz?: string;

  @ApiPropertyOptional({ description: 'Tavsif (ruscha)' })
  @IsOptional()
  @IsString()
  description_ru?: string;

  @ApiPropertyOptional({ description: 'Narx' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ description: 'Ombor miqdori' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Brend ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Kategoriya ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Katalog ID lar', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  catalogIds?: string[];

  @ApiPropertyOptional({ description: 'Rasm ID lar', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryIds?: string[];

  @ApiPropertyOptional({ description: 'Rasm URL lar', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryUrls?: string[];

  @ApiPropertyOptional({ description: 'Xususiyatlar matni' })
  @IsOptional()
  @IsString()
  specsText?: string;

  @ApiPropertyOptional({ description: 'Auditoriya', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  audience?: string[];

  @ApiPropertyOptional({ description: 'Korpus turlari', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formFactors?: string[];

  @ApiPropertyOptional({ description: 'Signal qayta ishlash' })
  @IsOptional()
  @IsString()
  signalProcessing?: string;

  @ApiPropertyOptional({ description: 'Quvvat darajasi' })
  @IsOptional()
  @IsString()
  powerLevel?: string;

  @ApiPropertyOptional({ description: 'Eshitish yo\'qotish darajalari', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hearingLossLevels?: string[];

  @ApiPropertyOptional({ description: 'Smartfon mosligi', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  smartphoneCompatibility?: string[];

  @ApiPropertyOptional({ description: 'Tinnitus qo\'llab-quvvatlash' })
  @IsOptional()
  @IsBoolean()
  tinnitusSupport?: boolean;

  @ApiPropertyOptional({ description: 'To\'lov usullari', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentOptions?: string[];

  @ApiPropertyOptional({ description: 'Mavjudlik holati' })
  @IsOptional()
  @IsString()
  availabilityStatus?: string;

  @ApiPropertyOptional({ description: 'Kirish matni (o\'zbekcha)' })
  @IsOptional()
  @IsString()
  intro_uz?: string;

  @ApiPropertyOptional({ description: 'Kirish matni (ruscha)' })
  @IsOptional()
  @IsString()
  intro_ru?: string;

  @ApiPropertyOptional({ description: 'Xususiyatlar (o\'zbekcha)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features_uz?: string[];

  @ApiPropertyOptional({ description: 'Xususiyatlar (ruscha)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features_ru?: string[];

  @ApiPropertyOptional({ description: 'Afzalliklar (o\'zbekcha)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits_uz?: string[];

  @ApiPropertyOptional({ description: 'Afzalliklar (ruscha)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits_ru?: string[];

  @ApiPropertyOptional({ description: 'Texnologiyalar (o\'zbekcha)' })
  @IsOptional()
  @IsString()
  tech_uz?: string;

  @ApiPropertyOptional({ description: 'Texnologiyalar (ruscha)' })
  @IsOptional()
  @IsString()
  tech_ru?: string;

  @ApiPropertyOptional({ description: 'Sozlash diapazoni (o\'zbekcha)' })
  @IsOptional()
  @IsString()
  fittingRange_uz?: string;

  @ApiPropertyOptional({ description: 'Sozlash diapazoni (ruscha)' })
  @IsOptional()
  @IsString()
  fittingRange_ru?: string;

  @ApiPropertyOptional({ description: 'Regulyator eslatma (o\'zbekcha)' })
  @IsOptional()
  @IsString()
  regulatoryNote_uz?: string;

  @ApiPropertyOptional({ description: 'Regulyator eslatma (ruscha)' })
  @IsOptional()
  @IsString()
  regulatoryNote_ru?: string;

  @ApiPropertyOptional({ description: 'Bog\'liq mahsulot ID lar', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedProductIds?: string[];

  @ApiPropertyOptional({ description: 'Foydali maqola slug lar', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usefulArticleSlugs?: string[];

  @ApiPropertyOptional({ description: 'Holat', enum: ['published', 'draft', 'archived'], default: 'published' })
  @IsOptional()
  @IsEnum(['published', 'draft', 'archived'])
  status?: 'published' | 'draft' | 'archived';
}



