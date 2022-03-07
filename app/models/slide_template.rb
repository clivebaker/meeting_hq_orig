class SlideTemplate < ApplicationRecord
  belongs_to :business_unit

  validates_presence_of :name, on: [:update, :create], message: "can't be blank"

  has_many :slide_template_components, dependent: :destroy
  has_many :components, through: :slide_template_components, dependent: :destroy



end
