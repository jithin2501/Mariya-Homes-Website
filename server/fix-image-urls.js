const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import your models
const Gallery = require('./models/Gallery');
const PropertyDetails = require('./models/PropertyDetails');
const Property = require('./models/Property');

const OLD_URL = 'http://localhost:5000';
const NEW_URL = 'https://maria-homes-backend.onrender.com';

async function updateImageUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update Gallery images
    console.log('\n📸 Updating Gallery images...');
    const galleries = await Gallery.find({});
    let galleryCount = 0;
    
    for (const gallery of galleries) {
      if (gallery.image && gallery.image.includes(OLD_URL)) {
        gallery.image = gallery.image.replace(OLD_URL, NEW_URL);
        await gallery.save();
        galleryCount++;
      }
    }
    console.log(`✅ Updated ${galleryCount} gallery images`);

    // Update PropertyDetails
    console.log('\n🏠 Updating Property Details...');
    const propertyDetails = await PropertyDetails.find({});
    let detailsCount = 0;
    
    for (const detail of propertyDetails) {
      let updated = false;

      // Update mainMedia
      if (detail.mainMedia && detail.mainMedia.includes(OLD_URL)) {
        detail.mainMedia = detail.mainMedia.replace(OLD_URL, NEW_URL);
        updated = true;
      }

      // Update gallery array
      if (detail.gallery && Array.isArray(detail.gallery)) {
        detail.gallery = detail.gallery.map(url => 
          url.includes(OLD_URL) ? url.replace(OLD_URL, NEW_URL) : url
        );
        updated = true;
      }

      // Update constructionProgress array
      if (detail.constructionProgress && Array.isArray(detail.constructionProgress)) {
        detail.constructionProgress = detail.constructionProgress.map(item => ({
          ...item,
          image: item.image.includes(OLD_URL) 
            ? item.image.replace(OLD_URL, NEW_URL) 
            : item.image
        }));
        updated = true;
      }

      if (updated) {
        await detail.save();
        detailsCount++;
      }
    }
    console.log(`✅ Updated ${detailsCount} property details`);

    // Update Properties
    console.log('\n🏘️  Updating Properties...');
    const properties = await Property.find({});
    let propertyCount = 0;
    
    for (const property of properties) {
      if (property.image && property.image.includes(OLD_URL)) {
        property.image = property.image.replace(OLD_URL, NEW_URL);
        await property.save();
        propertyCount++;
      }
    }
    console.log(`✅ Updated ${propertyCount} property images`);

    console.log('\n🎉 All image URLs updated successfully!');
    console.log(`   - Galleries: ${galleryCount}`);
    console.log(`   - Property Details: ${detailsCount}`);
    console.log(`   - Properties: ${propertyCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating URLs:', error);
    process.exit(1);
  }
}

updateImageUrls();