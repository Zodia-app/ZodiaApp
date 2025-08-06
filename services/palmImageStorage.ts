interface StoredPalmImages {
  leftHand: string | null;
  rightHand: string | null;
  timestamp: number;
}

class PalmImageStorage {
  private images: StoredPalmImages = {
    leftHand: null,
    rightHand: null,
    timestamp: 0,
  };

  storeImages(leftHandUri: string, rightHandUri: string) {
    this.images = {
      leftHand: leftHandUri,
      rightHand: rightHandUri,
      timestamp: Date.now(),
    };
  }

  getImages(): StoredPalmImages {
    return this.images;
  }

  clearImages() {
    this.images = {
      leftHand: null,
      rightHand: null,
      timestamp: 0,
    };
  }
}

export const palmImageStorage = new PalmImageStorage();