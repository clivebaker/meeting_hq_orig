class SlideTemplate < ApplicationRecord
  belongs_to :organisation

  validates_presence_of :name, on: [:update, :create], message: "can't be blank"
  validates_presence_of :content, on: [:update, :create], message: "can't be blank"

end
